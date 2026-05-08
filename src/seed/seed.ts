import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/users.schema';
import { Role } from '../common/enums/role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const admin = await userModel.findOne({ role: Role.ADMIN });

  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await userModel.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: Role.ADMIN,
    });

    console.log('Admin created successfully');
  } else {
    console.log('Admin already exists');
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Seed failed:', err);
});
