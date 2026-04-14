import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

export interface NotificationItem {
  id: string;
  type: 'payment' | 'withdrawal' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

@Injectable()
export class NotificationsService {
  // In-memory storage for notifications (can be moved to database later)
  private notifications: NotificationItem[] = [];

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto): Promise<NotificationItem> {
    const notification: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      isRead: false,
      actionUrl: dto.actionUrl,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(notification);
    return notification;
  }

  async getUserNotifications(userId: string, role: string): Promise<NotificationItem[]> {
    // Return notifications for specific user OR admin notifications
    return this.notifications.filter(n => {
      if (role === 'ADMIN') {
        return true; // Admins see all notifications
      }
      return n.actionUrl?.includes(userId); // Users see their own
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    this.notifications.forEach(n => {
      n.isRead = true;
    });
  }

  getUnreadCount(userId: string, role: string): number {
    return this.notifications.filter(n => {
      if (role === 'ADMIN') {
        return !n.isRead;
      }
      return !n.isRead && n.actionUrl?.includes(userId);
    }).length;
  }
}
