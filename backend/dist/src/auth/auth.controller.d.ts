import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private authService;
    private jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    login(loginDto: LoginDto, req: ExpressRequest, res: ExpressResponse): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
            photo: any;
            angkatan: any;
        };
    }>;
    refresh(refreshTokenDto: RefreshTokenDto, req: ExpressRequest, res: ExpressResponse): Promise<{
        access_token: string;
    }>;
    logout(refreshTokenDto: RefreshTokenDto, req: ExpressRequest, res: ExpressResponse): Promise<{
        message: string;
    }>;
    logoutAll(req: ExpressRequest, res: ExpressResponse): Promise<{
        message: string;
    }>;
    changePassword(req: ExpressRequest, changePasswordDto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): Promise<{
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
