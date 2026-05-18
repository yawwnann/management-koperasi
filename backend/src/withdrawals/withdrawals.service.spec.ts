import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalsService } from './withdrawals.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('WithdrawalsService', () => {
  let service: WithdrawalsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    saving: {
      findUnique: jest.fn(),
    },
    withdrawal: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  const mockEmailService = {
    sendAdminWithdrawalNotification: jest.fn(),
  };

  const mockNotificationsGateway = {
    broadcastNewWithdrawal: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<WithdrawalsService>(WithdrawalsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-1';
    const dto = {
      nominal: 10000,
      reason: 'test',
      savingType: 'Pokok' as any,
      paymentMethod: 'Cash' as any,
    };

    it('should throw BadRequestException if user already has a pending withdrawal', async () => {
      // Mock user savings
      mockPrismaService.saving.findUnique.mockResolvedValue({
        userId,
        total: new Prisma.Decimal(50000),
      });

      // Mock existing pending withdrawal
      mockPrismaService.withdrawal.findFirst.mockResolvedValue({
        id: 'withdrawal-1',
        status: 'PENDING',
      });

      await expect(service.create(userId, dto)).rejects.toThrow(
        new BadRequestException('Anda masih memiliki penarikan yang menunggu verifikasi. Silakan tunggu admin memproses penarikan Anda sebelum mengajukan penarikan baru.')
      );
    });

    it('should create withdrawal successfully if no pending withdrawal and enough balance', async () => {
      // Mock user savings
      mockPrismaService.saving.findUnique.mockResolvedValue({
        userId,
        total: new Prisma.Decimal(50000),
      });

      // No existing pending withdrawal
      mockPrismaService.withdrawal.findFirst.mockResolvedValue(null);

      // Mock breakdown
      mockPrismaService.payment.findMany.mockResolvedValue([
        { nominal: new Prisma.Decimal(50000), description: 'Simpanan Pokok' }
      ]);
      mockPrismaService.withdrawal.findMany.mockResolvedValue([]);

      // Mock withdrawal creation
      mockPrismaService.withdrawal.create.mockResolvedValue({
        id: 'new-withdrawal-1',
        userId,
        nominal: new Prisma.Decimal(10000),
        reason: 'test',
        savingType: 'Pokok',
        paymentMethod: 'Cash',
        status: 'PENDING',
        user: { name: 'User Test', email: 'test@example.com' }
      });

      // Mock finding admins
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.create(userId, dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('new-withdrawal-1');
      expect(mockPrismaService.withdrawal.create).toHaveBeenCalled();
    });
  });
});
