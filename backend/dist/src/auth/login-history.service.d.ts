import { PrismaService } from '../prisma/prisma.service';
export interface LoginHistoryData {
    userId: string;
    ipAddress: string;
    userAgent: string;
    status: 'SUCCESS' | 'FAILED';
    failureReason?: string;
}
export interface ParsedDeviceInfo {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
    deviceBrand: string | null;
    deviceModel: string | null;
}
export interface LocationInfo {
    country: string;
    city: string;
    region: string;
}
export declare class LoginHistoryService {
    private prisma;
    constructor(prisma: PrismaService);
    saveLogin(data: LoginHistoryData): Promise<{
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
    }>;
    getUserHistory(userId: string, page?: number, limit?: number): Promise<{
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
    }>;
    getAllHistory(page?: number, limit?: number, filters?: {
        userId?: string;
        status?: string;
        country?: string;
    }): Promise<{
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
    }>;
    private parseUserAgent;
    private getDeviceType;
    private getLocationFromIp;
}
