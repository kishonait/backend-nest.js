import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailProcessor } from './mail.processor';
import { MailCronService } from './mail.cron';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  controllers: [MailController],
  providers: [MailService, MailProcessor, MailCronService],
  exports: [MailService],
})
export class MailModule {}
