import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private configService;
    private readonly logger;
    private readonly uploadPath;
    private readonly maxFileSize;
    private readonly allowedMimes;
    constructor(configService: ConfigService);
    private ensureDir;
    saveFile(file: Express.Multer.File, subdir?: string): Promise<string>;
    deleteFile(relativeUrl: string): Promise<boolean>;
    getFullPath(relativeUrl: string): string;
}
