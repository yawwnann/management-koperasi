import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        actionUrl: dto.actionUrl,
        isAdmin: dto.isAdminNotification || false,
      },
    });

    return {
      id: notification.id,
      type: notification.type as any,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      actionUrl: notification.actionUrl || undefined,
      createdAt: notification.createdAt.toISOString(),
    };
  }

  async getUserNotifications(userId: string, role: string) {
    const whereConditions: any = {};

    if (role === 'ADMIN') {
      // Admins see their own notifications, admin-specific notifications, and general announcements
      whereConditions.OR = [{ userId }, { isAdmin: true }, { userId: null }];
    } else {
      // Users see their own notifications OR general system notifications that are not admin-only
      whereConditions.OR = [{ userId }, { userId: null, isAdmin: false }];
    }

    const notifications = await this.prisma.notification.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
    });

    return notifications.map((n) => ({
      id: n.id,
      type: n.type as any,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      actionUrl: n.actionUrl || undefined,
      createdAt: n.createdAt.toISOString(),
    }));
  }

  async markAsRead(notificationId: string) {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string, role: string) {
    if (role === 'ADMIN') {
      await this.prisma.notification.updateMany({
        where: {
          OR: [{ userId }, { isAdmin: true }],
        },
        data: { isRead: true },
      });
    } else {
      await this.prisma.notification.updateMany({
        where: {
          OR: [{ userId }, { userId: null, isAdmin: false }],
        },
        data: { isRead: true },
      });
    }
  }

  async getUnreadCount(userId: string, role: string): Promise<number> {
    const where: any = { isRead: false };

    if (role === 'ADMIN') {
      // Admins see all unread notifications
    } else {
      // Users see their own unread notifications OR general system notifications
      where.OR = [{ userId }, { userId: null }];
    }

    return await this.prisma.notification.count({ where });
  }
}
