import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';
import { LoginHistoryService } from './login-history.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private refreshTokenService;
    private loginHistoryService;
    private notificationsService;
    constructor(prisma: PrismaService, jwtService: JwtService, refreshTokenService: RefreshTokenService, loginHistoryService: LoginHistoryService, notificationsService: NotificationsService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto, userAgent?: string, ipAddress?: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
            photo: any;
            angkatan: any;
        };
    }>;
    refreshTokens(refreshToken: string, userAgent?: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(tokenId: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        angkatan: string | null;
        nim: string | null;
        fakultas: string | null;
        prodi: string | null;
        birthDate: Date | null;
        address: string | null;
        phone: string | null;
        photo: string | null;
        isActive: boolean;
    }>;
}
