import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

// Importations des entités et DTOs
import { StockEntity } from '../../entities/stock.entity';
import { OrderEntity } from '../../entities/order.entity';
import { UserEntity } from '../../entities/user.entity';
import { AddressEntity } from '../../entities/addresses.entity';
import { PromotionEntity } from '../../entities/promotion.entity';
import { PaymentSuccessMailService } from './paymentMail/paymentSuccessMail.service';
import { paymentFailMailService } from './paymentMail/paymentFailMail.service';
import { CartDto } from '../../shared/dtos/payment/cart.dto';
import { OrderStatus } from '../../shared/enum/order.enum';

// Mock de la librairie Stripe
jest.mock('stripe', () => {
  return {
    Stripe: jest.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    })),
  };
});

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let stockRepository: any;
  let orderRepository: any;
  let userRepository: any;
  let addressRepository: any;
  let promotionRepository: any;
  let dataSource: any;
  let mockPaymentSuccessMail: any;
  let mockPaymentFailMail: any;

  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv };
    process.env.SECRET_KEY_STRIPE = 'sk_test_mocked_key';
    process.env.SECRET_WEBHOOK_KEY = 'whsec_mocked_key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getRepositoryToken(StockEntity), useValue: { findOne: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(OrderEntity), useValue: { findOne: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(UserEntity), useValue: { findOneBy: jest.fn(), findOne: jest.fn() } },
        { provide: getRepositoryToken(AddressEntity), useValue: { findOneBy: jest.fn() } },
        { provide: getRepositoryToken(PromotionEntity), useValue: { findOne: jest.fn() } },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        { provide: PaymentSuccessMailService, useValue: { sendPaymentSuccessMail: jest.fn() } },
        { provide: paymentFailMailService, useValue: { sendPaymentFailMail: jest.fn() } },
      ],
    }).compile();

    paymentService = module.get<PaymentService>(PaymentService);
    stockRepository = module.get(getRepositoryToken(StockEntity));
    orderRepository = module.get(getRepositoryToken(OrderEntity));
    userRepository = module.get(getRepositoryToken(UserEntity));
    addressRepository = module.get(getRepositoryToken(AddressEntity));
    promotionRepository = module.get(getRepositoryToken(PromotionEntity));
    dataSource = module.get<DataSource>(DataSource);
    mockPaymentSuccessMail = module.get<PaymentSuccessMailService>(PaymentSuccessMailService);
    mockPaymentFailMail = module.get<paymentFailMailService>(paymentFailMailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  // ==========================================
  // VERIFICATION ORDER
  // ==========================================
  describe('verificationOrder', () => {
    const mockUser = { id: 1, mail: 'test@example.com', isVerified: true } as UserEntity;
    const mockCartDto: CartDto = {
      delivery_address_id: 10,
      billing_address_id: 20,
      items: [{ sku: 'ITEM-1', quantity: 2 }],
      promotion_code: '',
    };

    beforeEach(() => {
      userRepository.findOneBy.mockResolvedValue(mockUser);
      addressRepository.findOneBy.mockResolvedValue({});
      stockRepository.findOne.mockResolvedValue({ sku: 'ITEM-1', quantity: 10, product: { price: 50 } });
      orderRepository.save.mockResolvedValue({ id: 999 });
      jest.spyOn(paymentService, 'createCheckoutSession').mockResolvedValue({ url: 'http://stripe.com' } as any);
    });

    it('devrait jeter une NotFoundException si le stock/variant est introuvable', async () => {
      stockRepository.findOne.mockResolvedValue(null);
      await expect(paymentService.verificationOrder(mockCartDto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('devrait jeter une BadRequestException si le stock est insuffisant', async () => {
      stockRepository.findOne.mockResolvedValue({ sku: 'ITEM-1', quantity: 1, product: { price: 50 } });
      await expect(paymentService.verificationOrder(mockCartDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('devrait appliquer une réduction en pourcentage et sauvegarder la commande', async () => {
      const cartWithPromo = { ...mockCartDto, promotion_code: 'REDUC20' };
      promotionRepository.findOne.mockResolvedValue({ name: 'REDUC20', minAmount: 50, promotionType: 'percentage', percentageValue: 20 });

      await paymentService.verificationOrder(cartWithPromo, mockUser);

      const savedOrderArg = orderRepository.save.mock.calls[0][0];
      expect(savedOrderArg.totalAmount).toBe(80);
      expect(paymentService.createCheckoutSession).toHaveBeenCalled();
    });
  });

  // ==========================================
  // CREATE CHECKOUT SESSION
  // ==========================================
  describe('createCheckoutSession', () => {
    const mockItems = [
      { stock: { sku: 'ITEM-1', product: { name: 'T-shirt' } }, quantity: 2, priceAtPurchase: 50 },
    ] as any;

    it('devrait jeter une InternalServerErrorException si le nom du produit manque', async () => {
      const badItems = [{ stock: { sku: 'ITEM-1', product: {} }, quantity: 1, priceAtPurchase: 10 }] as any;
      await expect(paymentService.createCheckoutSession(999, 1, badItems, 'test@example.com')).rejects.toThrow(InternalServerErrorException);
    });

    it('devrait créer une session Stripe avec succès', async () => {
      // @ts-ignore
      paymentService['stripe'].checkout.sessions.create.mockResolvedValue({ url: 'http://stripe-session.com' });

      const result = await paymentService.createCheckoutSession(999, 1, mockItems, 'test@example.com');
      
      expect(paymentService['stripe'].checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
        customer_email: 'test@example.com',
        metadata: { orderId: '999', userId: '1' },
      }));
      expect(result).toEqual({ url: 'http://stripe-session.com' });
    });

    it('devrait intercepter les erreurs Stripe et jeter une InternalServerErrorException', async () => {
      (paymentService['stripe'].checkout.sessions.create as jest.Mock).mockRejectedValue(new Error('Stripe is down'));
      await expect(paymentService.createCheckoutSession(999, 1, mockItems, 'test@example.com')).rejects.toThrow('failed to create checkout session');
    });
  });

  // ==========================================
  // PAYMENT FAILED
  // ==========================================
  describe('paymentFailed', () => {
    it('devrait jeter une ForbiddenException si la commande n’existe pas', async () => {
      orderRepository.findOne.mockResolvedValue(null);
      await expect(paymentService.paymentFailed(999, 1)).rejects.toThrow(ForbiddenException);
    });

    it('devrait annuler la commande si elle est PENDING et envoyer un mail', async () => {
      const mockOrder = { id: 999, status: OrderStatus.PENDING, user: { mail: 'test@test.com' } };
      orderRepository.findOne.mockResolvedValue(mockOrder);
      jest.spyOn(paymentService, 'sendMailPaymentFail').mockResolvedValue(undefined);

      await paymentService.paymentFailed(999, 1);

      expect(mockOrder.status).toBe(OrderStatus.CANCELLED);
      expect(orderRepository.save).toHaveBeenCalledWith(mockOrder);
      expect(paymentService.sendMailPaymentFail).toHaveBeenCalledWith(999, 'test@test.com');
    });
  });

  // ==========================================
  // WEBHOOK STRIPE
  // ==========================================
  describe('constructEventWebhook', () => {
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
      mockReq = { rawBody: 'raw_body_data' };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
    });

    it('devrait jeter une erreur 401 si la signature est invalide', async () => {
      (paymentService['stripe'].webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await paymentService.constructEventWebhook(mockReq, mockRes, 'bad_signature');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith('webhook error: Invalid signature');
    });

    describe('checkout.session.completed', () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: { object: { metadata: { orderId: '999', userId: '1' } } },
      };

      it('devrait payer la commande, déduire le stock et envoyer un mail (Transaction OK)', async () => {
        (paymentService['stripe'].webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);

        const mockStock = { sku: 'ITEM-1', quantity: 10 };
        const mockOrder = { id: 999, status: OrderStatus.PENDING, items: [{ quantity: 2, stock: mockStock }] };
        const mockEntityManager = {
          findOne: jest.fn().mockResolvedValue(mockOrder),
          save: jest.fn(),
        };

        dataSource.transaction.mockImplementation(async (cb: any) => cb(mockEntityManager));
        userRepository.findOne.mockResolvedValue({ id: 1, mail: 'success@test.com' });
        jest.spyOn(paymentService, 'sendMailPaymentSuccess').mockResolvedValue(undefined);

        await paymentService.constructEventWebhook(mockReq, mockRes, 'valid_signature');

        expect(mockOrder.status).toBe(OrderStatus.PAID);
        expect(mockEntityManager.save).toHaveBeenCalledWith(mockOrder);
        expect(mockStock.quantity).toBe(8);
        expect(mockEntityManager.save).toHaveBeenCalledWith(mockStock);
        expect(paymentService.sendMailPaymentSuccess).toHaveBeenCalledWith('success@test.com', 999);
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });

    describe('checkout.session.expired', () => {
      it('devrait annuler la commande', async () => {
        const mockEvent = {
          type: 'checkout.session.expired',
          data: { object: { metadata: { orderId: '999' } } },
        };
        (paymentService['stripe'].webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
        
        const mockOrder = { id: 999, status: OrderStatus.PENDING };
        orderRepository.findOne.mockResolvedValue(mockOrder);

        await paymentService.constructEventWebhook(mockReq, mockRes, 'valid_signature');

        expect(mockOrder.status).toBe(OrderStatus.CANCELLED);
        expect(orderRepository.save).toHaveBeenCalledWith(mockOrder);
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });
  });

  // ==========================================
  // MAIL SERVICES
  // ==========================================
describe('Mail Sending Wrappers', () => {
    it('devrait appeler paymentSuccessMail', async () => {
      // Pas de spyOn ici ! On laisse le vrai code de la méthode s'exécuter
      await paymentService.sendMailPaymentSuccess('test@test.com', 999);
      
      expect(mockPaymentSuccessMail.sendPaymentSuccessMail).toHaveBeenCalledWith('test@test.com', 999);
    });

    it('devrait appeler paymentFailMail', async () => {
      await paymentService.sendMailPaymentFail(999, 'test@test.com');
      
      expect(mockPaymentFailMail.sendPaymentFailMail).toHaveBeenCalledWith(999, 'test@test.com');
    });
  });
});