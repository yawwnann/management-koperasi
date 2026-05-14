import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export interface RefreshTokenPayload {
    sub: string;
    jti: string;
    iat: number;
    exp: number;
}
export declare class RefreshTokenService {
    private prisma;
    private jwtService;
    private configService;
    private readonly refreshTokenSecret;
    private readonly refreshTokenExpiresIn;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    createToken(userId: string, userAgent?: string, rememberMe?: boolean): Promise<{
        token: string;
        tokenId: string;
    }>;
    validateToken(token: string): Promise<RefreshTokenPayload>;
    revokeToken(tokenId: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
    rotateToken(oldTokenId: string, userId: string, userAgent?: string): Promise<{
        token: string;
        tokenId: string;
    }>;
    getUserTokens(userId: string): Promise<{
        id: string;
        userAgent: string | null;
        expiresAt: Date;
        createdAt: Date;
    }[]>;
    private revokeTokenFamily;
    private hashToken;
    private parseExpiresIn;
}
