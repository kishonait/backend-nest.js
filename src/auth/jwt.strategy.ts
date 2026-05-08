import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const extractor = ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest: extractor,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    console.log('JWT Payload:', payload);

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
