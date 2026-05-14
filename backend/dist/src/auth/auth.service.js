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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const refresh_token_service_1 = require("./refresh-token.service");
const login_history_service_1 = require("./login-history.service");
const notifications_service_1 = require("../notifications/notifications.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    refreshTokenService;
    loginHistoryService;
    notificationsService;
    constructor(prisma, jwtService, refreshTokenService, loginHistoryService, notificationsService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.loginHistoryService = loginHistoryService;
        this.notificationsService = notificationsService;
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { password: _, ...result } = user;
        return result;
    }
    async login(loginDto, userAgent, ipAddress) {
        let user;
        try {
            user = await this.validateUser(loginDto.email, loginDto.password);
            if (ipAddress && userAgent) {
                this.loginHistoryService
                    .saveLogin({
                    userId: user.id,
                    ipAddress,
                    userAgent,
                    status: 'SUCCESS',
                })
                    .catch((err) => console.error('Failed to save login history:', err));
            }
        }
        catch (error) {
            if (ipAddress && userAgent) {
                const foundUser = await this.prisma.user
                    .findUnique({ where: { email: loginDto.email } })
                    .catch(() => null);
                if (foundUser) {
                    this.loginHistoryService
                        .saveLogin({
                        userId: foundUser.id,
                        ipAddress,
                        userAgent,
                        status: 'FAILED',
                        failureReason: error.message || 'Invalid credentials',
                    })
                        .catch((err) => console.error('Failed to save failed login history:', err));
                }
            }
            throw error;
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const access_token = await this.jwtService.signAsync(payload);
        const { token: refresh_token } = await this.refreshTokenService.createToken(user.id, userAgent, loginDto.rememberMe);
        return {
            access_token,
            refresh_token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                photo: user.photo,
                angkatan: user.angkatan,
            },
        };
    }
    async refreshTokens(refreshToken, userAgent) {
        const payload = await this.refreshTokenService.validateToken(refreshToken);
        const { token: newRefreshToken } = await this.refreshTokenService.rotateToken(payload.jti, payload.sub, userAgent);
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        const tokenPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const access_token = await this.jwtService.signAsync(tokenPayload);
        return {
            access_token,
            refresh_token: newRefreshToken,
        };
    }
    async logout(tokenId) {
        await this.refreshTokenService.revokeToken(tokenId);
    }
    async logoutAll(userId) {
        await this.refreshTokenService.revokeAllUserTokens(userId);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Password lama salah');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        await this.refreshTokenService.revokeAllUserTokens(userId);
        await this.notificationsService.create({
            type: 'system',
            title: 'Password Berubah',
            message: 'Password akun Anda telah berhasil diubah. Jika ini bukan tindakan Anda, segera hubungi admin.',
            userId,
        });
        return { message: 'Password berhasil diubah' };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                angkatan: true,
                nim: true,
                fakultas: true,
                prodi: true,
                birthDate: true,
                address: true,
                phone: true,
                photo: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        refresh_token_service_1.RefreshTokenService,
        login_history_service_1.LoginHistoryService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map