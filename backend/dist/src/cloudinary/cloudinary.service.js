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
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const config_1 = require("@nestjs/config");
let CloudinaryService = class CloudinaryService {
    configService;
    uploadFolder;
    constructor(configService) {
        this.configService = configService;
        this.uploadFolder = this.configService.get('CLOUDINARY_UPLOAD_FOLDER', 'kopma');
    }
    async uploadImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPEG, PNG, and WebP images are allowed');
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size must not exceed 5MB');
        }
        try {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: this.uploadFolder,
                    transformation: [
                        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
                        { quality: 'auto' },
                    ],
                }, (error, result) => {
                    if (error) {
                        reject(new common_1.BadRequestException(`Failed to upload image: ${error.message}`));
                    }
                    else if (result) {
                        resolve({
                            url: result.secure_url,
                            public_id: result.public_id,
                        });
                    }
                    else {
                        reject(new common_1.BadRequestException('Upload failed: no result returned'));
                    }
                });
                uploadStream.end(file.buffer);
            });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to upload image to Cloudinary');
        }
    }
    async deleteImage(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            return result.result === 'ok';
        }
        catch (error) {
            console.error('Failed to delete image from Cloudinary:', error);
            return false;
        }
    }
    extractPublicId(url) {
        try {
            const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-z]+$/);
            return match ? match[1] : null;
        }
        catch {
            return null;
        }
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map