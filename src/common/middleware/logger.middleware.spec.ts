import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call next()', () => {
    const req = { method: 'GET', originalUrl: '/users' } as any;
    const res = {} as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should log method and url', () => {
    const req = { method: 'POST', originalUrl: '/auth/login' } as any;
    const res = {} as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(console.log).toHaveBeenCalledWith('👉 POST /auth/login');
  });

  it('should log DELETE request correctly', () => {
    const req = { method: 'DELETE', originalUrl: '/products/123' } as any;
    const res = {} as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(console.log).toHaveBeenCalledWith('👉 DELETE /products/123');
  });
});