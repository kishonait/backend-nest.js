import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import nodemailer from 'nodemailer';
import * as path from 'path';
import { welcomeTemplate } from './templates/welcome.template';

interface MailJobData {
  to: string;
  name: string;
}

@Processor('email-queue')
export class MailProcessor {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASS as string,
    },
  });

  @Process('welcome-email')
  async handleWelcomeEmail(job: Job<MailJobData>) {
    const { to, name } = job.data;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Welcome Email 🎉',
        text: welcomeTemplate(name),
        attachments: [
          {
            filename: 'welcome.pdf',
            path: path.join(process.cwd(), 'uploads/welcome.pdf'),
          },
        ],
      });

      console.log(`✅ Email sent successfully to: ${to}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      console.log(`❌ Email failed for: ${to}`, message);

      throw error;
    }
  }
}
