import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

const mockProductsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call productsService.create and return result', async () => {
      const body = { name: 'Test Product', price: 100, stock: 10 } as any;
      const files = [{ filename: 'img.jpg' }] as any[];
      const mockResponse = { message: 'Product created successfully', data: {} };

      mockProductsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(body, files);

      expect(mockProductsService.create).toHaveBeenCalledWith(body, files);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAll', () => {
    it('should call productsService.findAll without filters', async () => {
      mockProductsService.findAll.mockResolvedValue({ data: [] });

      const result = await controller.findAll();

      expect(mockProductsService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
      expect(result).toEqual({ data: [] });
    });

    it('should pass query filters to service', async () => {
      mockProductsService.findAll.mockResolvedValue({ data: [] });

      await controller.findAll('laptop', '5', '2024-01-01');

      expect(mockProductsService.findAll).toHaveBeenCalledWith('laptop', '5', '2024-01-01');
    });
  });

  describe('findOne', () => {
    it('should call productsService.findOne with id', async () => {
      mockProductsService.findOne.mockResolvedValue({ data: {} });

      const result = await controller.findOne('prod123');

      expect(mockProductsService.findOne).toHaveBeenCalledWith('prod123');
      expect(result).toEqual({ data: {} });
    });
  });

  describe('update', () => {
    it('should call productsService.update with id, body, files', async () => {
      const body = { name: 'Updated' } as any;
      const files = [] as any[];
      mockProductsService.update.mockResolvedValue({ message: 'Product updated successfully' });

      const result = await controller.update('prod123', body, files);

      expect(mockProductsService.update).toHaveBeenCalledWith('prod123', body, files);
      expect(result).toEqual({ message: 'Product updated successfully' });
    });
  });

  describe('remove', () => {
    it('should call productsService.remove with id', async () => {
      mockProductsService.remove.mockResolvedValue({ message: 'Product deleted successfully' });

      const result = await controller.remove('prod123');

      expect(mockProductsService.remove).toHaveBeenCalledWith('prod123');
      expect(result).toEqual({ message: 'Product deleted successfully' });
    });
  });
});