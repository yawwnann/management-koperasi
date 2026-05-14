import { LoginHistoryService } from './login-history.service';
interface JwtRequest extends Request {
    user: {
        sub: string;
        role: string;
        email: string;
        name: string;
    };
}
export declare class LoginHistoryController {
    private loginHistoryService;
    constructor(loginHistoryService: LoginHistoryService);
    getUserHistory(req: JwtRequest, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            history: {
                id: string;
                userAgent: string;
                createdAt: Date;
                userId: string;
                ipAddress: string;
                browser: string | null;
                browserVersion: string | null;
                os: string | null;
                osVersion: string | null;
                device: string | null;
                deviceBrand: string | null;
                deviceModel: string | null;
                country: string | null;
                city: string | null;
                region: string | null;
                status: string;
                failureReason: string | null;
            }[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    getAllHistory(page?: number, limit?: number, userId?: string, status?: string, country?: string): Promise<{
        success: boolean;
        data: {
            history: ({
                user: {
                    email: string;
                    id: string;
                    name: string;
                    role: import("@prisma/client").$Enums.Role;
                };
            } & {
                id: string;
                userAgent: string;
                createdAt: Date;
                userId: string;
                ipAddress: string;
                browser: string | null;
                browserVersion: string | null;
                os: string | null;
                osVersion: string | null;
                device: string | null;
                deviceBrand: string | null;
                deviceModel: string | null;
                country: string | null;
                city: string | null;
                region: string | null;
                status: string;
                failureReason: string | null;
            })[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
}
export {};
