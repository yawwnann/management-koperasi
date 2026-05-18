import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    notification: {
      count: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUnreadCount', () => {
    const userId = 'user-1';

    it('should query with ADMIN filters when role is ADMIN', async () => {
      mockPrismaService.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount(userId, 'ADMIN');

      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: {
          isRead: false,
          OR: [{ userId }, { isAdmin: true }, { userId: null }],
        },
      });
      expect(result).toBe(5);
    });

    it('should query with user filters when role is not ADMIN', async () => {
      mockPrismaService.notification.count.mockResolvedValue(2);

      const result = await service.getUnreadCount(userId, 'ANGGOTA');

      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: {
          isRead: false,
          OR: [{ userId }, { userId: null, isAdmin: false }],
        },
      });
      expect(result).toBe(2);
    });
  });

  describe('getUserNotifications', () => {
    const userId = 'user-1';
    const mockNotifications = [
      {
        id: 'notif-1',
        type: 'system',
        title: 'Test',
        message: 'Message',
        isRead: false,
        actionUrl: null,
        createdAt: new Date(),
      },
    ];

    it('should query with ADMIN filters when role is ADMIN', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications(userId, 'ADMIN');

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ userId }, { isAdmin: true }, { userId: null }],
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result.length).toBe(1);
    });

    it('should query with user filters when role is not ADMIN', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications(userId, 'ANGGOTA');

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ userId }, { userId: null, isAdmin: false }],
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result.length).toBe(1);
    });
  });

  describe('markAllAsRead', () => {
    const userId = 'user-1';

    it('should update many with ADMIN filters when role is ADMIN', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      await service.markAllAsRead(userId, 'ADMIN');

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: {
          OR: [{ userId }, { isAdmin: true }],
        },
        data: { isRead: true },
      });
    });

    it('should update many with user filters when role is not ADMIN', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 2 });

      await service.markAllAsRead(userId, 'ANGGOTA');

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: {
          OR: [{ userId }, { userId: null, isAdmin: false }],
        },
        data: { isRead: true },
      });
    });
  });
});
