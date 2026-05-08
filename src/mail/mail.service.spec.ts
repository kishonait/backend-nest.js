import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

const mockEmailQueue = {
  add: jest.fn(),
};

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: 'BullQueue_email-queue', useValue: mockEmailQueue },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendWelcomeMail', () => {
    it('should add welcome-email job to queue', async () => {
      mockEmailQueue.add.mockResolvedValue({ id: 'job1' });

      const result = await service.sendWelcomeMail('test@gmail.com', 'Test User');

      expect(mockEmailQueue.add).toHaveBeenCalledWith('welcome-email', {
        to: 'test@gmail.com',
        name: 'Test User',
      });
      expect(result).toEqual({ message: 'Email added to queue successfully 🚀' });
    });

    it('should return error when queue throws', async () => {
      mockEmailQueue.add.mockRejectedValue(new Error('Queue connection failed'));

      const result = await service.sendWelcomeMail('test@gmail.com', 'Test User');

      expect(result).toEqual({
        message: 'Failed to add email to queue',
        error: 'Queue connection failed',
      });
    });

    it('should return unknown error on non-Error exception', async () => {
      mockEmailQueue.add.mockRejectedValue('unexpected error');

      const result = await service.sendWelcomeMail('test@gmail.com', 'Test User');

      expect(result).toEqual({
        message: 'Failed to add email to queue',
        error: 'Unknown error',
      });
    });
  });
});