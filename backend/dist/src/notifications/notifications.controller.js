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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const create_custom_notification_dto_1 = require("./dto/create-custom-notification.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationsController = class NotificationsController {
    notificationsService;
    notificationsGateway;
    constructor(notificationsService, notificationsGateway) {
        this.notificationsService = notificationsService;
        this.notificationsGateway = notificationsGateway;
    }
    async getNotifications(req) {
        const notifications = await this.notificationsService.getUserNotifications(req.user.sub, req.user.role);
        return {
            success: true,
            data: notifications,
        };
    }
    async getUnreadCount(req) {
        const count = await this.notificationsService.getUnreadCount(req.user.sub, req.user.role);
        return {
            success: true,
            data: { count },
        };
    }
    async markAsRead(id) {
        await this.notificationsService.markAsRead(id);
        return {
            success: true,
            message: 'Notification marked as read',
        };
    }
    async markAllAsRead(req) {
        await this.notificationsService.markAllAsRead(req.user.sub, req.user.role);
        return {
            success: true,
            message: 'All notifications marked as read',
        };
    }
    async deleteAll(req) {
        await this.notificationsService.deleteAll(req.user.sub, req.user.role);
        return {
            success: true,
            message: 'All notifications deleted',
        };
    }
    async create(createNotificationDto) {
        const notification = await this.notificationsService.create(createNotificationDto);
        return {
            success: true,
            data: notification,
        };
    }
    async createCustom(dto) {
        const isBroadcast = !dto.targetUserId;
        const notification = await this.notificationsService.create({
            type: 'system',
            title: dto.title,
            message: dto.message,
            actionUrl: dto.actionUrl,
            userId: dto.targetUserId,
            isAdminNotification: false,
        });
        this.notificationsGateway.broadcastCustomNotification({
            targetUserId: dto.targetUserId,
            notification: {
                id: notification.id,
                title: dto.title,
                message: dto.message,
                actionUrl: dto.actionUrl,
            },
        });
        return {
            success: true,
            data: notification,
            message: isBroadcast
                ? 'Notification broadcasted to all users'
                : 'Notification sent to user',
        };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('read-all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('custom'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_custom_notification_dto_1.CreateCustomNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createCustom", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        notifications_gateway_1.NotificationsGateway])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map