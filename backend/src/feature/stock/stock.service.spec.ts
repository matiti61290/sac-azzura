import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { StockEntity } from '../../entities/stock.entity';
import { ProductEntity } from '../../entities/product.entity';
import { ColorEntity } from '../../entities/color.entity';
import { MaterialEntity } from '../../entities/material.entity';
import { SubcategoryEntity } from '../../entities/subcategory.entity';

describe('StockService', () => {
  let stockService: StockService;
  
  let stockRepository: any;
  let productRepository: any;
  let colorRepository: any;
  let materialRepository: any;
  let subcategoryRepository: any;

  const mockStockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductRepository = { findOne: jest.fn() };
  const mockColorRepository = { findOne: jest.fn() };
  const mockMaterialRepository = { findOne: jest.fn() };
  const mockSubcategoryRepository = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: getRepositoryToken(StockEntity),
          useValue: mockStockRepository,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ColorEntity),
          useValue: mockColorRepository,
        },
        {
          provide: getRepositoryToken(MaterialEntity),
          useValue: mockMaterialRepository,
        },
        {
          provide: getRepositoryToken(SubcategoryEntity),
          useValue: mockSubcategoryRepository,
        },
      ],
    }).compile();

    stockService = module.get<StockService>(StockService);
    
    stockRepository = module.get(getRepositoryToken(StockEntity));
    productRepository = module.get(getRepositoryToken(ProductEntity));
    colorRepository = module.get(getRepositoryToken(ColorEntity));
    materialRepository = module.get(getRepositoryToken(MaterialEntity));
    subcategoryRepository = module.get(getRepositoryToken(SubcategoryEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // GET ALL STOCK
  describe('getAllStock', () => {
    it('devrait retourner tout le stock avec les relations', async () => {
      const mockStocks = [{ id: 1, quantity: 10 }, { id: 2, quantity: 5 }];
      stockRepository.find.mockResolvedValue(mockStocks);

      const result = await stockService.getAllStock();

      expect(stockRepository.find).toHaveBeenCalledWith({
        relations: ['color', 'material', 'product'],
      });
      expect(result).toEqual(mockStocks);
    });

    it('devrait jeter une NotFoundException si find retourne null', async () => {
      stockRepository.find.mockResolvedValue(null);
      await expect(stockService.getAllStock()).rejects.toThrow(NotFoundException);
    });
  });

  // GET STOCK BY SKU
  describe('getStockBySku', () => {
    it('devrait retourner le stock correspondant au SKU', async () => {
      const mockStock = { id: 1, sku: 'TEST-SKU' };
      stockRepository.findOne.mockResolvedValue(mockStock);

      const result = await stockService.getStockBySku('TEST-SKU');

      expect(stockRepository.findOne).toHaveBeenCalledWith({
        where: { sku: 'TEST-SKU' },
        relations: ['color', 'material', 'product'],
      });
      expect(result).toEqual(mockStock);
    });

    it('devrait jeter une NotFoundException si le SKU n’existe pas', async () => {
      stockRepository.findOne.mockResolvedValue(null);
      await expect(stockService.getStockBySku('UNKNOWN-SKU')).rejects.toThrow(NotFoundException);
    });
  });

  // GET STOCK BY ID
  describe('getStockById', () => {
    it('devrait retourner le stock correspondant à l’ID', async () => {
      const mockStock = { id: 1, sku: 'TEST-SKU' };
      stockRepository.findOne.mockResolvedValue(mockStock);

      const result = await stockService.getStockById(1);

      expect(stockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['color', 'material', 'product'],
      });
      expect(result).toEqual(mockStock);
    });

    it('devrait jeter une NotFoundException si l’ID n’existe pas', async () => {
      stockRepository.findOne.mockResolvedValue(null);
      await expect(stockService.getStockById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ADD STOCK
  describe('addStock', () => {
    const mockColor = { id: 1, sku_code: 'COL1' };
    const mockMaterial = { id: 1, sku_code: 'MAT1' };
    const mockProduct = { id: 1, sku_code: 'PROD1' };
    const mockSubcategory = { id: 1, sku_code: 'SUB1', category: { sku_code: 'CAT1' } };

    beforeEach(() => {
      colorRepository.findOne.mockResolvedValue(mockColor);
      materialRepository.findOne.mockResolvedValue(mockMaterial);
      productRepository.findOne.mockResolvedValue(mockProduct);
      subcategoryRepository.findOne.mockResolvedValue(mockSubcategory);
    });

    it('devrait jeter une NotFoundException s’il manque une entité (ex: Couleur)', async () => {
      colorRepository.findOne.mockResolvedValue(null);
      
      await expect(stockService.addStock(10, 1, 1, 1, 1)).rejects.toThrow(NotFoundException);
    });

    it('devrait générer le bon SKU, créer le stock, le sauvegarder et le retourner', async () => {
      const expectedSku = 'PROD1_CAT1_SUB1_COL1_MAT1';
      
      const mockCreatedStock = { quantity: 10, sku: expectedSku };
      const mockSavedStock = { id: 1, ...mockCreatedStock };
      
      stockRepository.create.mockReturnValue(mockCreatedStock);
      stockRepository.save.mockResolvedValue(mockSavedStock);

      jest.spyOn(stockService, 'getStockBySku').mockResolvedValue(mockSavedStock as any);

      const result = await stockService.addStock(10, 1, 1, 1, 1);

      expect(colorRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(subcategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['category'] });
      
      expect(stockRepository.create).toHaveBeenCalledWith({
        quantity: 10,
        product: mockProduct,
        material: mockMaterial,
        color: mockColor,
        sku: expectedSku,
      });

      expect(stockRepository.save).toHaveBeenCalledWith(mockCreatedStock);
      expect(stockService.getStockBySku).toHaveBeenCalledWith(expectedSku);
      expect(result).toEqual(mockSavedStock);
    });
  });

  // UPDATE STOCK
  describe('updateStock', () => {
    it('devrait jeter une NotFoundException si le stock n’existe pas', async () => {
      stockRepository.findOne.mockResolvedValue(null);
      await expect(stockService.updateStock(50, 'UNKNOWN-SKU')).rejects.toThrow(NotFoundException);
    });

    it('devrait mettre à jour la quantité, sauvegarder et retourner le stock actualisé', async () => {
      const mockExistingStock = { id: 1, sku: 'TEST-SKU', quantity: 10 };
      const mockUpdatedStock = { id: 1, sku: 'TEST-SKU', quantity: 50 }; // Quantité modifiée

      stockRepository.findOne.mockResolvedValue(mockExistingStock);
      stockRepository.save.mockResolvedValue(mockUpdatedStock);
      
      jest.spyOn(stockService, 'getStockBySku').mockResolvedValue(mockUpdatedStock as any);

      const result = await stockService.updateStock(50, 'TEST-SKU');

      expect(stockRepository.findOne).toHaveBeenCalledWith({ where: { sku: 'TEST-SKU' } });
      
      // On vérifie que la propriété a bien été mutée avant la sauvegarde
      expect(mockExistingStock.quantity).toBe(50);
      expect(stockRepository.save).toHaveBeenCalledWith(mockExistingStock);
      
      expect(stockService.getStockBySku).toHaveBeenCalledWith('TEST-SKU');
      expect(result).toEqual(mockUpdatedStock);
    });
  });

  // DELETE STOCK BY PRODUCT ID (Actually by SKU)
  describe('deleteStockByProductId', () => {
    it('devrait jeter une NotFoundException si le stock n’existe pas', async () => {
      stockRepository.findOne.mockResolvedValue(null);
      await expect(stockService.deleteStockByProductId('UNKNOWN-SKU')).rejects.toThrow(NotFoundException);
    });

    it('devrait trouver le stock et le supprimer', async () => {
      const mockStock = { id: 1, sku: 'TEST-SKU' };
      stockRepository.findOne.mockResolvedValue(mockStock);

      await stockService.deleteStockByProductId('TEST-SKU');

      expect(stockRepository.findOne).toHaveBeenCalledWith({ where: { sku: 'TEST-SKU' } });
      expect(stockRepository.remove).toHaveBeenCalledWith(mockStock);
    });
  });
});