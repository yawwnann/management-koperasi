import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    url: string;
    public_id: string;
}
export declare class CloudinaryService {
    private configService;
    private uploadFolder;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File): Promise<UploadResult>;
    deleteImage(publicId: string): Promise<boolean>;
    extractPublicId(url: string): string | null;
}
