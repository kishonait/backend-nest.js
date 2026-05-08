import { Test, TestingModule } from '@nestjs/testing';
import { MailCronService } from './mail.cron';

const mockEmailQueue = {
  add: jest.fn(),
};

describe('MailCronService', () => {
  let service: MailCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailCronService,
        { provide: 'BullQueue_email-queue', useValue: mockEmailQueue },
      ],
    }).compile();

    service = module.get<MailCronService>(MailCronService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkSystemHealthEmails', () => {
    it('should add test welcome-email job to queue', async () => {
      mockEmailQueue.add.mockResolvedValue({ id: 'job1' });

      await service.checkSystemHealthEmails();

      expect(mockEmailQueue.add).toHaveBeenCalledWith('welcome-email', {
        to: 'cron-test@gmail.com',
        name: 'Cron User',
      });
      expect(mockEmailQueue.add).toHaveBeenCalledTimes(1);
    });

    it('should handle queue error gracefully', async () => {
      mockEmailQueue.add.mockRejectedValue(new Error('Queue failed'));

      await expect(service.checkSystemHealthEmails()).rejects.toThrow('Queue failed');
    });
  });

  describe('sendDailyWelcomeEmails', () => {
    it('should add jobs for all daily users', async () => {
      mockEmailQueue.add.mockResolvedValue({ id: 'job1' });

      await service.sendDailyWelcomeEmails();

      // 2 users defined in the cron
      expect(mockEmailQueue.add).toHaveBeenCalledTimes(2);
      expect(mockEmailQueue.add).toHaveBeenCalledWith('welcome-email', {
        to: 'test1@gmail.com',
        name: 'User1',
      });
      expect(mockEmailQueue.add).toHaveBeenCalledWith('welcome-email', {
        to: 'test2@gmail.com',
        name: 'User2',
      });
    });

    it('should handle queue error for a user', async () => {
      mockEmailQueue.add.mockRejectedValue(new Error('Queue error'));

      await expect(service.sendDailyWelcomeEmails()).rejects.toThrow('Queue error');
    });
  });
});