import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './users.schema';

const mockUsers = [
  { _id: '1', name: 'Test User', email: 'test@gmail.com', role: 'USER' },
  { _id: '2', name: 'Admin User', email: 'admin@gmail.com', role: 'ADMIN' },
];

const mockUserModel = {
  find: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users successfully', async () => {
      mockUserModel.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockUserModel.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
    });

    it('should return error object when DB throws error', async () => {
      mockUserModel.find.mockRejectedValue(new Error('DB connection failed'));

      const result = await service.findAll();

      expect(result).toEqual({ error: 'DB connection failed' });
    });

    it('should return unknown error when non-Error is thrown', async () => {
      mockUserModel.find.mockRejectedValue('some string error');

      const result = await service.findAll();

      expect(result).toEqual({ error: 'Unknown error' });
    });

    it('should return empty array when no users exist', async () => {
      mockUserModel.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});