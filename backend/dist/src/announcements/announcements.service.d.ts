import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
export declare class AnnouncementsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(adminId: string, dto: CreateAnnouncementDto): Promise<{
        creator: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        title: string;
        message: string;
        startDate: Date;
        endDate: Date;
        createdBy: string;
    }>;
    findAll(): Promise<({
        creator: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        title: string;
        message: string;
        startDate: Date;
        endDate: Date;
        createdBy: string;
    })[]>;
    findOne(id: string): Promise<{
        creator: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        title: string;
        message: string;
        startDate: Date;
        endDate: Date;
        createdBy: string;
    }>;
    findActive(): Promise<{
        id: string;
        title: string;
        message: string;
        startDate: Date;
        endDate: Date;
    }[]>;
    update(id: string, dto: UpdateAnnouncementDto): Promise<{
        creator: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        title: string;
        message: string;
        startDate: Date;
        endDate: Date;
        createdBy: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
