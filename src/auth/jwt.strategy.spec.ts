import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
  get: jest.fn().mockReturnValue('test-secret-key'),
} as unknown as ConfigService;

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy(mockConfigService);
  });

  describe('constructor', () => {
    it('should throw error when JWT_SECRET is not defined', () => {
      const badConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;

      expect(() => new JwtStrategy(badConfigService)).toThrow('JWT_SECRET is not defined');
    });

    it('should create strategy when JWT_SECRET is defined', () => {
      expect(strategy).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return user object from JWT payload', () => {
      const payload = {
        sub: 'user123',
        email: 'test@gmail.com',
        role: 'USER',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user123',
        email: 'test@gmail.com',
        role: 'USER',
      });
    });

    it('should return userId as undefined when sub is missing', () => {
      const payload = { email: 'test@gmail.com', role: 'ADMIN' } as any;

      const result = strategy.validate(payload);

      expect(result.userId).toBeUndefined();
      expect(result.role).toBe('ADMIN');
    });
  });
});