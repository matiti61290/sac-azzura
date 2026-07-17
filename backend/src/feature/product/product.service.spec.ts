import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductEntity } from '../../entities/product.entity';
import { SubcategoryEntity } from '../../entities/subcategory.entity';
import { ImageEntity } from '../../entities/image.entity';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { StockService } from '../stock/stock.service';
import { AddProductDto } from '../../shared/dtos/product/addProduct.dto';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: any;
  let subCategoryRepository: any;
  let imageRepository: any;
  let awsS3Service: any;
  let stockService: any;

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockSubCategoryRepository = {
    findOne: jest.fn(),
  };

  const mockImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockAwsS3Service = {
    getFileUrl: jest.fn(),
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockStockService = {
    addStock: jest.fn(),
    updateStock: jest.fn(),
    deleteStockByProductId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(SubcategoryEntity),
          useValue: mockSubCategoryRepository,
        },
        {
          provide: getRepositoryToken(ImageEntity),
          useValue: mockImageRepository,
        },
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
        {
          provide: StockService,
          useValue: mockStockService,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get(getRepositoryToken(ProductEntity));
    subCategoryRepository = module.get(getRepositoryToken(SubcategoryEntity));
    imageRepository = module.get(getRepositoryToken(ImageEntity));
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
    stockService = module.get<StockService>(StockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // GET ALL PRODUCTS
  describe('getAllProducts', () => {
    it('devrait retourner une liste de produits avec les URLs d’images signées', async () => {
      const mockProducts = [
        { id: 1, name: 'Sac', images: [{ key: 'image1.jpg' }] },
        { id: 2, name: 'Portefeuille', images: [{ key: 'image2.jpg' }] },
      ];
      
      productRepository.find.mockResolvedValue(mockProducts);
      awsS3Service.getFileUrl
        .mockResolvedValueOnce('http://s3.com/image1.jpg')
        .mockResolvedValueOnce('http://s3.com/image2.jpg');

      const result = await productService.getAllProducts();

      expect(productRepository.find).toHaveBeenCalledWith({
        relations: ['images', 'stocks', 'subcategory', 'subcategory.category'],
      });
      expect(awsS3Service.getFileUrl).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { id: 1, name: 'Sac', images: [{ key: 'image1.jpg', url: 'http://s3.com/image1.jpg' }] },
        { id: 2, name: 'Portefeuille', images: [{ key: 'image2.jpg', url: 'http://s3.com/image2.jpg' }] },
      ]);
    });

    it('devrait jeter une NotFoundException si aucun produit n’est trouvé', async () => {
      productRepository.find.mockResolvedValue(null);
      await expect(productService.getAllProducts()).rejects.toThrow(NotFoundException);
    });
  });

  // FIND PRODUCT
  describe('findProduct', () => {
    it('devrait retourner un produit avec ses images signées', async () => {
      const mockProduct = {
        id: 1,
        name: 'Sac',
        images: [{ key: 'image1.jpg' }, { key: 'image2.jpg' }],
      };

      productRepository.findOne.mockResolvedValue(mockProduct);
      awsS3Service.getFileUrl.mockResolvedValue('http://s3.com/signed-url');

      const result = await productService.findProduct(1);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['images', 'subcategory.category', 'stocks', 'stocks.color', 'stocks.material'],
      });
      expect(awsS3Service.getFileUrl).toHaveBeenCalledTimes(2);
      expect(result.images[0].url).toBe('http://s3.com/signed-url');
    });

    it('devrait jeter une NotFoundException si le produit n’existe pas', async () => {
      productRepository.findOne.mockResolvedValue(null);
      await expect(productService.findProduct(999)).rejects.toThrow(NotFoundException);
    });
  });

  // CREATE PRODUCT
  describe('createProduct', () => {
    const mockAddProductDto: AddProductDto = {
      name: 'Nouveau Sac',
      description: 'Super sac',
      price: 50.50,
      sku_code: 'SAC-123',
      subcategoryId: 2,
      variations: JSON.stringify([{ quantity: 10, colorId: '1', materialId: '1' }]), // Ajout de la propriété manquante
    };

    const mockFiles = [
      { originalname: 'test1.jpg', buffer: Buffer.from('test') },
    ] as Express.Multer.File[];

    const mockVariations = [
      { quantity: 10, colorId: '1', materialId: '1' },
      { quantity: 0, colorId: '2', materialId: '2' },
    ];

    it('devrait jeter une NotFoundException si la sous-catégorie n’existe pas', async () => {
      subCategoryRepository.findOne.mockResolvedValue(null);
      
      await expect(productService.createProduct(mockAddProductDto, mockFiles, mockVariations)).rejects.toThrow(NotFoundException);
    });

    it('devrait créer le produit, uploader les fichiers, ajouter le stock et retourner le produit', async () => {
      const mockSubcategory = { id: 2, name: 'Sacs à main' };
      subCategoryRepository.findOne.mockResolvedValue(mockSubcategory);
      
      const mockCreatedProduct = { id: 1, name: 'Nouveau Sac' };
      productRepository.create.mockReturnValue(mockCreatedProduct);
      productRepository.save.mockResolvedValue(mockCreatedProduct);
      
      imageRepository.create.mockReturnValue({ key: 'mocked-key', product: mockCreatedProduct });
      awsS3Service.uploadFile.mockResolvedValue(true);
      stockService.addStock.mockResolvedValue(true);

      jest.spyOn(productService, 'findProduct').mockResolvedValue({ ...mockCreatedProduct, images: [] } as any);

      const result = await productService.createProduct(mockAddProductDto, mockFiles, mockVariations);

      expect(subCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      
      expect(productRepository.create).toHaveBeenCalledWith({
        name: 'Nouveau Sac',
        description: 'Super sac',
        price: 50.5,
        isActive: true,
        subcategory: mockSubcategory,
        images: [],
        sku_code: 'SAC-123',
      });
      expect(productRepository.save).toHaveBeenCalledWith(mockCreatedProduct);
      expect(awsS3Service.uploadFile).toHaveBeenCalledWith(mockFiles[0], expect.stringContaining('products/'));
      expect(imageRepository.save).toHaveBeenCalled();
      expect(stockService.addStock).toHaveBeenCalledTimes(1);
      expect(stockService.addStock).toHaveBeenCalledWith(10, 1, 1, 1, 2);

      expect(result).toEqual({ ...mockCreatedProduct, images: [] });
    });
  });

  // UPDATE PRODUCT
  describe('updateProduct', () => {
    const mockUpdateDto = {
      name: 'Sac Modifié',
      price: 60,
      quantity: 5,
      stock_sku: 'STOCK-123',
      files: [{ originalname: 'new.jpg', buffer: Buffer.from('test') }] as Express.Multer.File[],
    } as any; 

    it('devrait jeter une NotFoundException si le produit n’existe pas', async () => {
      productRepository.findOne.mockResolvedValue(null);
      await expect(productService.updateProduct(1, mockUpdateDto)).rejects.toThrow(NotFoundException);
    });

    it('devrait mettre à jour le produit, uploader les nouvelles images, mettre à jour le stock et retourner le produit', async () => {
      const mockProduct = { id: 1, name: 'Ancien nom' };
      productRepository.findOne.mockResolvedValue(mockProduct);
      
      const mockSavedProduct = { id: 1, name: 'Sac Modifié', price: 60 };
      productRepository.save.mockResolvedValue(mockSavedProduct);

      awsS3Service.uploadFile.mockResolvedValue(true);
      imageRepository.create.mockReturnValue({ key: 'mocked-key' });
      
      jest.spyOn(productService, 'findProduct').mockResolvedValue(mockSavedProduct as any);

      const result = await productService.updateProduct(1, mockUpdateDto);

      expect(mockProduct.name).toBe('Sac Modifié');
      expect(productRepository.save).toHaveBeenCalledWith(mockProduct);
      
      expect(awsS3Service.uploadFile).toHaveBeenCalledWith(mockUpdateDto.files[0], expect.stringContaining('products/'));
      expect(imageRepository.save).toHaveBeenCalled();
      
      expect(stockService.updateStock).toHaveBeenCalledWith(5, 'STOCK-123');
      
      expect(result).toEqual(mockSavedProduct);
    });
  });

  // DELETE PRODUCT
  describe('deleteProduct', () => {
    it('devrait jeter une NotFoundException si le produit n’existe pas', async () => {
      productRepository.findOne.mockResolvedValue(null);
      await expect(productService.deleteProduct(1)).rejects.toThrow(NotFoundException);
    });

    it('devrait supprimer les fichiers S3, les images en BDD, les stocks et le produit', async () => {
      const mockProduct = {
        id: 1,
        images: [{ key: 'image1.jpg' }, { key: 'image2.jpg' }],
        stocks: [{ sku: 'SKU-1' }, { sku: 'SKU-2' }],
      };

      productRepository.findOne.mockResolvedValue(mockProduct);
      productRepository.remove.mockResolvedValue({ deleted: true });

      const result = await productService.deleteProduct(1);

      expect(awsS3Service.deleteFile).toHaveBeenCalledTimes(2);
      expect(awsS3Service.deleteFile).toHaveBeenCalledWith('image1.jpg');
      expect(imageRepository.remove).toHaveBeenCalledTimes(2);

      expect(stockService.deleteStockByProductId).toHaveBeenCalledTimes(2);
      expect(stockService.deleteStockByProductId).toHaveBeenCalledWith('SKU-1');

      expect(productRepository.remove).toHaveBeenCalledWith(mockProduct);
      
      expect(result).toEqual({ deleted: true });
    });
  });
});