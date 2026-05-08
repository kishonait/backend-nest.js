import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { User, UserDocument } from '../users/users.schema';
import { Role } from '../common/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,

    private jwtService: JwtService,

    // QUEUE INJECTION (IMPORTANT)
    @InjectQueue('email-queue')
    private emailQueue: Queue,
  ) {}

  // REGISTER
  async register(data: RegisterDto) {
    try {
      const existingUser = await this.userModel.findOne({
        email: data.email,
      });

      if (existingUser) {
        return {
          message: 'User already exists with this email',
        };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user: UserDocument = await this.userModel.create({
        ...data,
        password: hashedPassword,
        role: (data.role?.toUpperCase() as Role) || Role.USER,
      });

      // SEND EMAIL USING QUEUE (NOT DIRECT EMAIL)
      await this.emailQueue.add('welcome-email', {
        to: user.email,
        name: user.name,
      });

      return {
        message: 'User registered successfully',
        data: user,
      };
    } catch (err: unknown) {
      let message = 'Unknown error';

      if (err instanceof Error) {
        message = err.message;
      }

      return {
        message: 'Error',
        error: message,
      };
    }
  }

  // LOGIN
  async login(data: LoginDto) {
    try {
      const user = await this.userModel.findOne({
        email: data.email,
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isMatch = await bcrypt.compare(data.password, user.password);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.jwtService.sign({
        id: user._id,
        role: user.role,
      });

      return {
        message: 'Login success',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (err: unknown) {
      let message = 'Login failed';

      if (err instanceof Error) {
        message = err.message;
      }

      return {
        message: 'Login failed',
        error: message,
      };
    }
  }
}
