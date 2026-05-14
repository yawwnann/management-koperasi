"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let RefreshTokenService = class RefreshTokenService {
    prisma;
    jwtService;
    configService;
    refreshTokenSecret;
    refreshTokenExpiresIn;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        const secret = this.configService.get('REFRESH_TOKEN_SECRET') ||
            process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
        }
        this.refreshTokenSecret = secret;
        this.refreshTokenExpiresIn =
            this.configService.get('REFRESH_TOKEN_EXPIRES_IN') ||
                process.env.REFRESH_TOKEN_EXPIRES_IN ||
                '30d';
    }
    async createToken(userId, userAgent) {
        const tokenId = crypto.randomUUID();
        const token = this.jwtService.sign({
            sub: userId,
            jti: tokenId,
        }, {
            secret: this.refreshTokenSecret,
            expiresIn: '30d',
        });
        const expiresAt = new Date();
        const expiresInMs = this.parseExpiresIn(this.refreshTokenExpiresIn);
        expiresAt.setTime(expiresAt.getTime() + expiresInMs);
        await this.prisma.refreshToken.create({
            data: {
                id: tokenId,
                token: await this.hashToken(token),
                userId,
                userAgent: userAgent || null,
                expiresAt,
            },
        });
        return { token, tokenId };
    }
    async validateToken(token) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(token, {
                secret: this.refreshTokenSecret,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { id: payload.jti },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Refresh token not found');
        }
        const hashedInputToken = await this.hashToken(token);
        if (storedToken.token !== hashedInputToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (storedToken.revokedAt) {
            throw new common_1.UnauthorizedException('Refresh token has been revoked');
        }
        if (new Date() > storedToken.expiresAt) {
            throw new common_1.UnauthorizedException('Refresh token has expired');
        }
        if (storedToken.replacedByTokenId) {
            const newToken = await this.prisma.refreshToken.findUnique({
                where: { id: storedToken.replacedByTokenId },
            });
            if (newToken?.revokedAt) {
                await this.revokeTokenFamily(storedToken.id);
                throw new common_1.UnauthorizedException('Security violation: Token reuse detected. All tokens have been revoked. Please login again.');
            }
        }
        return payload;
    }
    async revokeToken(tokenId) {
        await this.prisma.refreshToken.update({
            where: { id: tokenId },
            data: { revokedAt: new Date() },
        });
    }
    async revokeAllUserTokens(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { revokedAt: new Date() },
        });
    }
    async rotateToken(oldTokenId, userId, userAgent) {
        const { token, tokenId } = await this.createToken(userId, userAgent);
        await this.prisma.refreshToken.update({
            where: { id: oldTokenId },
            data: { replacedByTokenId: tokenId },
        });
        return { token, tokenId };
    }
    async getUserTokens(userId) {
        return this.prisma.refreshToken.findMany({
            where: {
                userId,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            select: {
                id: true,
                userAgent: true,
                createdAt: true,
                expiresAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async revokeTokenFamily(tokenId) {
        const token = await this.prisma.refreshToken.findUnique({
            where: { id: tokenId },
            include: {
                nextToken: true,
                replacedByToken: true,
            },
        });
        if (!token)
            return;
        await this.revokeToken(tokenId);
        if (token.nextToken) {
            await this.revokeToken(token.nextToken.id);
        }
        if (token.replacedByToken) {
            await this.revokeToken(token.replacedByToken.id);
        }
        await this.prisma.refreshToken.updateMany({
            where: {
                userId: token.userId,
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });
    }
    async hashToken(token) {
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        return hash;
    }
    parseExpiresIn(expiresIn) {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) {
            throw new Error(`Invalid expires_in format: ${expiresIn}`);
        }
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's':
                return value * 1000;
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            default:
                throw new Error(`Unknown time unit: ${unit}`);
        }
    }
};
exports.RefreshTokenService = RefreshTokenService;
exports.RefreshTokenService = RefreshTokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], RefreshTokenService);
//# sourceMappingURL=refresh-token.service.js.map