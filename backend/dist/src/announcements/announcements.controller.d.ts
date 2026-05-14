import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
export declare class AnnouncementsController {
    private readonly announcementsService;
    constructor(announcementsService: AnnouncementsService);
    getActive(): Promise<{
        success: boolean;
        data: {
            id: string;
            title: string;
            message: string;
            startDate: Date;
            endDate: Date;
        }[];
    }>;
    findAll(): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    create(req: {
        user: {
            sub: string;
        };
    }, dto: CreateAnnouncementDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    update(id: string, dto: UpdateAnnouncementDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
