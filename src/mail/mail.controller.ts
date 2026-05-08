import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('welcome')
  sendWelcome(@Body() body: { email: string; name: string }) {
    return this.mailService.sendWelcomeMail(body.email, body.name);
  }
}
