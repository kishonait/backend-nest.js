import { MailProcessor } from './mail.processor';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

import nodemailer from 'nodemailer';

describe('MailProcessor', () => {
  let processor: MailProcessor;
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    processor = new MailProcessor();
    // Access the mock transporter's sendMail
    mockSendMail = (nodemailer.createTransport({} as any) as any).sendMail;
    // Reassign processor's transporter to the mock
    (processor as any).transporter = { sendMail: mockSendMail };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleWelcomeEmail', () => {
    const mockJob = {
      data: { to: 'test@gmail.com', name: 'Test User' },
    } as any;

    it('should send welcome email successfully', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg123' });

      await processor.handleWelcomeEmail(mockJob);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@gmail.com',
          subject: 'Welcome Email 🎉',
        }),
      );
    });

    it('should throw error when sendMail fails', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(processor.handleWelcomeEmail(mockJob)).rejects.toThrow('SMTP error');
    });

    it('should include PDF attachment in email', async () => {
      mockSendMail.mockResolvedValue({});

      await processor.handleWelcomeEmail(mockJob);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({ filename: 'welcome.pdf' }),
          ]),
        }),
      );
    });
  });
});