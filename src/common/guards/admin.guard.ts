import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: AuthUser;
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthRequest>();

    const user = req.user;

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can access');
    }

    return true;
  }
}
