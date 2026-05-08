import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { Product } from './products.schema';

const mockProduct = {
  _id: 'prod123',
  name: 'Test Product',
  price: 100,
  stock: 10,
  images: ['image1.jpg'],
};

const mockProductModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: mockProductModel },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── CREATE ───────────────────────────────────────────────

  describe('create', () => {
    const createDto = { name: 'Test Product', price: 100, stock: 10 } as any;
    const files = [{ filename: 'image1.jpg' }] as any[];

    it('should create product successfully with images', async () => {
      mockProductModel.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto, files);

      expect(mockProductModel.create).toHaveBeenCalledWith({
        ...createDto,
        images: ['image1.jpg'],
      });
      expect(result.message).toBe('Product created successfully');
      expect(result.data).toEqual(mockProduct);
    });

    it('should create product with empty images when no files', async () => {
      mockProductModel.create.mockResolvedValue({ ...mockProduct, images: [] });

      const result = await service.create(createDto, []);

      expect(result.data).toBeDefined();
    });

    it('should return error on DB exception', async () => {
      mockProductModel.create.mockRejectedValue(new Error('DB error'));

      const result = await service.create(createDto, files);

      expect(result).toEqual({ message: 'Error creating product', error: 'DB error' });
    });
  });

  // ─── FIND ALL ─────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all products without filters', async () => {
      mockProductModel.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(mockProductModel.find).toHaveBeenCalledWith({});
      expect(result.data).toEqual([mockProduct]);
    });

    it('should apply name filter (case insensitive regex)', async () => {
      mockProductModel.find.mockResolvedValue([mockProduct]);

      await service.findAll('Test');

      expect(mockProductModel.find).toHaveBeenCalledWith({
        name: { $regex: 'Test', $options: 'i' },
      });
    });

    it('should apply stock filter', async () => {
      mockProductModel.find.mockResolvedValue([mockProduct]);

      await service.findAll(undefined, '5');

      expect(mockProductModel.find).toHaveBeenCalledWith({
        stock: { $gte: 5 },
      });
    });

    it('should apply date filter', async () => {
      mockProductModel.find.mockResolvedValue([mockProduct]);

      await service.findAll(undefined, undefined, '2024-01-01');

      expect(mockProductModel.find).toHaveBeenCalledWith({
        createdAt: { $gte: new Date('2024-01-01') },
      });
    });

    it('should return error on exception', async () => {
      mockProductModel.find.mockRejectedValue(new Error('DB error'));

      const result = await service.findAll();

      expect(result).toEqual({ message: 'Error fetching products', error: 'DB error' });
    });
  });

  // ─── FIND ONE ─────────────────────────────────────────────

  describe('findOne', () => {
    it('should return product by id', async () => {
      mockProductModel.findById.mockResolvedValue(mockProduct);

      const result = await service.findOne('prod123');

      expect(mockProductModel.findById).toHaveBeenCalledWith('prod123');
      expect(result.data).toEqual(mockProduct);
    });

    it('should return error on invalid id', async () => {
      mockProductModel.findById.mockRejectedValue(new Error('Cast error'));

      const result = await service.findOne('invalid');

      expect(result).toEqual({ message: 'Error fetching product', error: 'Cast error' });
    });
  });

  // ─── UPDATE ───────────────────────────────────────────────

  describe('update', () => {
    const updateDto = { name: 'Updated Product' } as any;

    it('should update product with new images', async () => {
      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      mockProductModel.findByIdAndUpdate.mockResolvedValue(updatedProduct);

      const files = [{ filename: 'new-image.jpg' }] as any[];
      const result = await service.update('prod123', updateDto, files);

      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'prod123',
        { name: 'Updated Product', images: ['new-image.jpg'] },
        { new: true },
      );
      expect(result.data).toEqual(updatedProduct);
    });

    it('should update product without images when files empty', async () => {
      mockProductModel.findByIdAndUpdate.mockResolvedValue(mockProduct);

      await service.update('prod123', updateDto, []);

      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'prod123',
        { name: 'Updated Product' },
        { new: true },
      );
    });

    it('should return error on update failure', async () => {
      mockProductModel.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

      const result = await service.update('prod123', updateDto, []);

      expect(result).toEqual({ message: 'Error updating product', error: 'Update failed' });
    });
  });

  // ─── REMOVE ───────────────────────────────────────────────

  describe('remove', () => {
    it('should delete product and return success message', async () => {
      mockProductModel.findByIdAndDelete.mockResolvedValue(mockProduct);

      const result = await service.remove('prod123');

      expect(mockProductModel.findByIdAndDelete).toHaveBeenCalledWith('prod123');
      expect(result.message).toBe('Product deleted successfully');
    });

    it('should return error on delete failure', async () => {
      mockProductModel.findByIdAndDelete.mockRejectedValue(new Error('Delete failed'));

      const result = await service.remove('prod123');

      expect(result).toEqual({ message: 'Error deleting product', error: 'Delete failed' });
    });
  });
});