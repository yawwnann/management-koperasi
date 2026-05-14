import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateNotificationDto): Promise<{
        id: string;
        type: any;
        title: string;
        message: string;
        isRead: boolean;
        actionUrl: string | undefined;
        createdAt: string;
    }>;
    getUserNotifications(userId: string, role: string): Promise<{
        id: string;
        type: any;
        title: string;
        message: string;
        isRead: boolean;
        actionUrl: string | undefined;
        createdAt: string;
    }[]>;
    markAsRead(notificationId: string): Promise<void>;
    markAllAsRead(userId: string, role: string): Promise<void>;
    deleteAll(userId: string, role: string): Promise<void>;
    getUnreadCount(userId: string, role: string): Promise<number>;
}
