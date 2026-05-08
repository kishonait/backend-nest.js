import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

const mockMailService = {
  sendWelcomeMail: jest.fn(),
};

describe('MailController', () => {
  let controller: MailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [{ provide: MailService, useValue: mockMailService }],
    }).compile();

    controller = module.get<MailController>(MailController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendWelcome', () => {
    it('should call mailService.sendWelcomeMail with email and name', async () => {
      const body = { email: 'test@gmail.com', name: 'Test User' };
      const mockResponse = { message: 'Email added to queue successfully 🚀' };

      mockMailService.sendWelcomeMail.mockResolvedValue(mockResponse);

      const result = await controller.sendWelcome(body);

      expect(mockMailService.sendWelcomeMail).toHaveBeenCalledWith(body.email, body.name);
      expect(result).toEqual(mockResponse);
    });

    it('should return error when service fails', async () => {
      mockMailService.sendWelcomeMail.mockResolvedValue({
        message: 'Failed to add email to queue',
        error: 'Queue error',
      });

      const result = await controller.sendWelcome({ email: 'x@x.com', name: 'X' });

      expect(result).toEqual({
        message: 'Failed to add email to queue',
        error: 'Queue error',
      });
    });
  });
});