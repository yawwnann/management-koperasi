import { ConfigService } from '@nestjs/config';
export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private configService;
    private readonly resend;
    private readonly from;
    private readonly fromName;
    private readonly logger;
    constructor(configService: ConfigService);
    sendEmail(options: SendEmailOptions): Promise<boolean>;
    sendWelcomeEmail(to: string, name: string): Promise<boolean>;
    sendPaymentNotification(to: string, userName: string, amount: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<boolean>;
    sendWithdrawalNotification(to: string, userName: string, amount: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<boolean>;
    sendAdminPaymentNotification(adminEmail: string, userName: string, amount: number): Promise<boolean>;
    sendAdminWithdrawalNotification(adminEmail: string, userName: string, amount: number): Promise<boolean>;
}
