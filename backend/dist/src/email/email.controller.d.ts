import { EmailService } from './email.service';
export declare class EmailController {
    private emailService;
    constructor(emailService: EmailService);
    testSend(body?: {
        to?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
