export declare class CreateNotificationDto {
    type: 'payment' | 'withdrawal' | 'system';
    title: string;
    message: string;
    actionUrl?: string;
    userId?: string;
    isAdminNotification?: boolean;
}
