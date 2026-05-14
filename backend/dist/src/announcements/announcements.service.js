"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnnouncementsService = class AnnouncementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(adminId, dto) {
        return this.prisma.announcement.create({
            data: {
                title: dto.title,
                message: dto.message,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                isActive: dto.isActive ?? true,
                createdBy: adminId,
            },
            include: {
                creator: { select: { id: true, name: true } },
            },
        });
    }
    async findAll() {
        return this.prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                creator: { select: { id: true, name: true } },
            },
        });
    }
    async findOne(id) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, name: true } },
            },
        });
        if (!announcement)
            throw new common_1.NotFoundException('Announcement not found');
        return announcement;
    }
    async findActive() {
        const now = new Date();
        return this.prisma.announcement.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: { startDate: 'asc' },
            select: {
                id: true,
                title: true,
                message: true,
                startDate: true,
                endDate: true,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.announcement.update({
            where: { id },
            data: {
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.message !== undefined && { message: dto.message }),
                ...(dto.startDate !== undefined && {
                    startDate: new Date(dto.startDate),
                }),
                ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
            include: {
                creator: { select: { id: true, name: true } },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.announcement.delete({ where: { id } });
        return { message: 'Announcement deleted successfully' };
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnnouncementsService);
//# sourceMappingURL=announcements.service.js.map