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
exports.LoginHistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ua_parser_js_1 = require("ua-parser-js");
const geoip = __importStar(require("geoip-lite"));
let LoginHistoryService = class LoginHistoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveLogin(data) {
        const deviceInfo = this.parseUserAgent(data.userAgent);
        const locationInfo = this.getLocationFromIp(data.ipAddress);
        return this.prisma.loginHistory.create({
            data: {
                userId: data.userId,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                browser: deviceInfo.browser,
                browserVersion: deviceInfo.browserVersion,
                os: deviceInfo.os,
                osVersion: deviceInfo.osVersion,
                device: deviceInfo.device,
                deviceBrand: deviceInfo.deviceBrand,
                deviceModel: deviceInfo.deviceModel,
                country: locationInfo.country,
                city: locationInfo.city,
                region: locationInfo.region,
                status: data.status,
                failureReason: data.failureReason || null,
            },
        });
    }
    async getUserHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [history, total] = await Promise.all([
            this.prisma.loginHistory.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.loginHistory.count({ where: { userId } }),
        ]);
        return {
            history,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getAllHistory(page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.country)
            where.country = filters.country;
        const [history, total] = await Promise.all([
            this.prisma.loginHistory.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            }),
            this.prisma.loginHistory.count({ where }),
        ]);
        return {
            history,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    parseUserAgent(userAgent) {
        const parser = new ua_parser_js_1.UAParser();
        parser.setUA(userAgent);
        const result = parser.getResult();
        return {
            browser: result.browser.name || 'Unknown',
            browserVersion: result.browser.version || '',
            os: result.os.name || 'Unknown',
            osVersion: result.os.version || '',
            device: this.getDeviceType(result),
            deviceBrand: result.device.vendor || null,
            deviceModel: result.device.model || null,
        };
    }
    getDeviceType(result) {
        if (result.device.type === 'tablet')
            return 'Tablet';
        if (result.device.type === 'mobile')
            return 'Mobile';
        if (result.device.type === 'smarttv')
            return 'Smart TV';
        if (result.device.type === 'wearable')
            return 'Wearable';
        if (result.device.type === 'console')
            return 'Console';
        return 'Desktop';
    }
    getLocationFromIp(ipAddress) {
        if (ipAddress === '127.0.0.1' ||
            ipAddress === '::1' ||
            ipAddress === 'localhost' ||
            ipAddress.startsWith('192.168.') ||
            ipAddress.startsWith('10.') ||
            ipAddress.startsWith('172.')) {
            return {
                country: 'Local Network',
                city: 'Local',
                region: 'Local',
            };
        }
        const geo = geoip.lookup(ipAddress);
        if (geo) {
            return {
                country: geo.country || 'Unknown',
                city: geo.city || 'Unknown',
                region: geo.region || 'Unknown',
            };
        }
        return {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
        };
    }
};
exports.LoginHistoryService = LoginHistoryService;
exports.LoginHistoryService = LoginHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoginHistoryService);
//# sourceMappingURL=login-history.service.js.map