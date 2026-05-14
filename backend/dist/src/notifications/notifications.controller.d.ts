import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateCustomNotificationDto } from './dto/create-custom-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly notificationsGateway;
    constructor(notificationsService: NotificationsService, notificationsGateway: NotificationsGateway);
    getNotifications(req: {
        user: {
            sub: string;
            role: string;
        };
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            type: any;
            title: string;
            message: string;
            isRead: boolean;
            actionUrl: string | undefined;
            createdAt: string;
        }[];
    }>;
    getUnreadCount(req: {
        user: {
            sub: string;
            role: string;
        };
    }): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    markAsRead(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markAllAsRead(req: {
        user: {
            sub: string;
            role: string;
        };
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteAll(req: {
        user: {
            sub: string;
            role: string;
        };
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    create(createNotificationDto: CreateNotificationDto): Promise<{
        success: boolean;
        data: {
            id: string;
            type: any;
            title: string;
            message: string;
            isRead: boolean;
            actionUrl: string | undefined;
            createdAt: string;
        };
    }>;
    createCustom(dto: CreateCustomNotificationDto): Promise<{
        success: boolean;
        data: {
            id: string;
            type: any;
            title: string;
            message: string;
            isRead: boolean;
            actionUrl: string | undefined;
            createdAt: string;
        };
        message: string;
    }>;
}
