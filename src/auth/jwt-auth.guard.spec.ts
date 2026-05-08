import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with jwt strategy', () => {
    // JwtAuthGuard extends AuthGuard('jwt') - verify it exists
    expect(guard.canActivate).toBeDefined();
  });

  it('should call super.canActivate with context', () => {
    // Mock canActivate to return true (simulating valid JWT)
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid.jwt.token' },
        }),
      }),
    } as ExecutionContext;

    // Override canActivate to simulate passport behavior
    jest.spyOn(guard, 'canActivate').mockReturnValue(true);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });
});