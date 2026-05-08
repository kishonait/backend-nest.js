import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { User } from '../users/users.schema';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

const mockUser = {
  _id: 'user123',
  name: 'Test User',
  email: 'test@gmail.com',
  password: 'hashedPassword',
  role: 'USER',
};

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

const mockEmailQueue = {
  add: jest.fn().mockResolvedValue({ id: 'job123' }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'BullQueue_email-queue', useValue: mockEmailQueue },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── REGISTER ───────────────────────────────────────────────

  describe('register', () => {
    const registerDto = {
      name: 'Test User',
      email: 'test@gmail.com',
      password: 'password123',
    };

    it('should register user successfully and add to email queue', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: registerDto.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockEmailQueue.add).toHaveBeenCalledWith('welcome-email', {
        to: mockUser.email,
        name: mockUser.name,
      });
      expect(result).toEqual({
        message: 'User registered successfully',
        data: mockUser,
      });
    });

    it('should return message when user already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({ message: 'User already exists with this email' });
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    it('should return error on DB exception', async () => {
      mockUserModel.findOne.mockRejectedValue(new Error('DB error'));

      const result = await service.register(registerDto);

      expect(result).toEqual({ message: 'Error', error: 'DB error' });
    });

    it('should return unknown error on non-Error exception', async () => {
      mockUserModel.findOne.mockRejectedValue('unexpected');

      const result = await service.register(registerDto);

      expect(result).toEqual({ message: 'Error', error: 'Unknown error' });
    });
  });

  // ─── LOGIN ───────────────────────────────────────────────────

  describe('login', () => {
    const loginDto = { email: 'test@gmail.com', password: 'password123' };

    it('should login successfully and return token', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: mockUser._id,
        role: mockUser.role,
      });
      expect(result).toEqual({
        message: 'Login success',
        data: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
        token: 'mock.jwt.token',
      });
    });

    it('should return error when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.login(loginDto);

      expect(result).toEqual({ message: 'Login failed', error: 'User not found' });
    });

    it('should return error when password does not match', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.login(loginDto);

      expect(result).toEqual({ message: 'Login failed', error: 'Invalid credentials' });
    });

    it('should return error on DB exception', async () => {
      mockUserModel.findOne.mockRejectedValue(new Error('Connection timeout'));

      const result = await service.login(loginDto);

      expect(result).toEqual({ message: 'Login failed', error: 'Connection timeout' });
    });
  });
});