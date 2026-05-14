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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const uuid_1 = require("uuid");
let StorageService = StorageService_1 = class StorageService {
    configService;
    logger = new common_1.Logger(StorageService_1.name);
    uploadPath;
    maxFileSize;
    allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
    ];
    constructor(configService) {
        this.configService = configService;
        this.uploadPath = path.resolve(this.configService.get('UPLOAD_PATH', './uploads'));
        this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 5 * 1024 * 1024);
    }
    async ensureDir(dir) {
        try {
            await fs.mkdir(dir, { recursive: true });
        }
        catch {
            throw new common_1.BadRequestException('Failed to create upload directory');
        }
    }
    async saveFile(file, subdir = 'general') {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (!this.allowedMimes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPEG, PNG, and WebP images are allowed');
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException('File size must not exceed 5MB');
        }
        const ext = path.extname(file.originalname) || '.jpg';
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const targetDir = path.join(this.uploadPath, subdir);
        await this.ensureDir(targetDir);
        const fullPath = path.join(targetDir, filename);
        await fs.writeFile(fullPath, file.buffer);
        return `/uploads/${subdir}/${filename}`;
    }
    async deleteFile(relativeUrl) {
        if (!relativeUrl)
            return false;
        try {
            const relativePath = relativeUrl.replace(/^\/uploads\//, '');
            const fullPath = path.join(this.uploadPath, relativePath);
            const resolvedPath = path.resolve(fullPath);
            if (!resolvedPath.startsWith(path.resolve(this.uploadPath))) {
                this.logger.warn(`Path traversal detected: ${relativeUrl}`);
                return false;
            }
            await fs.unlink(resolvedPath);
            return true;
        }
        catch (err) {
            const nodeErr = err;
            if (nodeErr.code === 'ENOENT') {
                this.logger.warn(`File not found for deletion: ${relativeUrl}`);
                return false;
            }
            this.logger.error(`Failed to delete file: ${relativeUrl}`, err);
            return false;
        }
    }
    getFullPath(relativeUrl) {
        const relativePath = relativeUrl.replace(/^\/uploads\//, '');
        return path.join(this.uploadPath, relativePath);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map