import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const registerDto = { name: 'Test', email: 'test@gmail.com', password: '123456' };
      const mockResponse = { message: 'User registered successfully', data: {} };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto as any);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockResponse);
    });

    it('should return existing user message', async () => {
      mockAuthService.register.mockResolvedValue({
        message: 'User already exists with this email',
      });

      const result = await controller.register({ email: 'test@gmail.com' } as any);

      expect(result).toEqual({ message: 'User already exists with this email' });
    });
  });

  describe('login', () => {
    it('should call authService.login and return token', async () => {
      const loginDto = { email: 'test@gmail.com', password: '123456' };
      const mockResponse = {
        message: 'Login success',
        data: { id: '1', name: 'Test', email: 'test@gmail.com', role: 'USER' },
        token: 'mock.jwt.token',
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto as any);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockResponse);
    });

    it('should return error when login fails', async () => {
      mockAuthService.login.mockResolvedValue({
        message: 'Login failed',
        error: 'User not found',
      });

      const result = await controller.login({ email: 'x@x.com', password: 'wrong' } as any);

      expect(result).toEqual({ message: 'Login failed', error: 'User not found' });
    });
  });
});