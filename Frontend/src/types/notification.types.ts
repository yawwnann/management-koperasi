export interface Notification {
  id: string;
  type: 'payment' | 'withdrawal' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  data: { count: number };
}
