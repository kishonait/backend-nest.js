import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class MailCronService {
  constructor(@InjectQueue('email-queue') private emailQueue: Queue) {}

  // 📅 DAILY CRON (10 AM  '*/10 * * * * *')
  @Cron('0 10 * * *')  
  async checkSystemHealthEmails() {
    console.log('🔥 CRON HIT (10 AM daily):', new Date().toISOString());
 
    const job = await this.emailQueue.add('welcome-email', {
      to: 'cron-test@gmail.com',
      name: 'Cron User',
    });
 
    console.log('📩 JOB ADDED TO QUEUE ID:', job.id);
  }

  // 📅 DAILY CRON (9 AM)
  @Cron('0 9 * * *')
  async sendDailyWelcomeEmails() {
    console.log('📅 DAILY CRON STARTED:', new Date().toISOString());

    const users = [
      { email: 'test1@gmail.com', name: 'User1' },
      { email: 'test2@gmail.com', name: 'User2' },
    ];

    for (const user of users) {
      const job = await this.emailQueue.add('welcome-email', {
        to: user.email,
        name: user.name,
      });

      console.log(`📩 QUEUE JOB CREATED: ${job.id} -> ${user.email}`);
    }

    console.log('🚀 ALL DAILY EMAILS PUSHED TO QUEUE');
  }
}
