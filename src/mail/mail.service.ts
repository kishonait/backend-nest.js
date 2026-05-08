import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class MailService {
  constructor(@InjectQueue('email-queue') private emailQueue: Queue) {}

  async sendWelcomeMail(to: string, name: string) {
    try {
      // 👉 instead of sending email directly, push to queue
      await this.emailQueue.add('welcome-email', {
        to,
        name,
      });

      return {
        message: 'Email added to queue successfully 🚀',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      return {
        message: 'Failed to add email to queue',
        error: message,
      };
    }
  }
}
