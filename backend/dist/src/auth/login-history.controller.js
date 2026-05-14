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
exports.LoginHistoryController = void 0;
const common_1 = require("@nestjs/common");
const login_history_service_1 = require("./login-history.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let LoginHistoryController = class LoginHistoryController {
    loginHistoryService;
    constructor(loginHistoryService) {
        this.loginHistoryService = loginHistoryService;
    }
    async getUserHistory(req, page, limit) {
        const result = await this.loginHistoryService.getUserHistory(req.user.sub, parseInt(page) || 1, parseInt(limit) || 20);
        return {
            success: true,
            data: result,
        };
    }
    async getAllHistory(page, limit, userId, status, country) {
        const result = await this.loginHistoryService.getAllHistory(parseInt(page) || 1, parseInt(limit) || 20, { userId, status, country });
        return {
            success: true,
            data: result,
        };
    }
};
exports.LoginHistoryController = LoginHistoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], LoginHistoryController.prototype, "getUserHistory", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], LoginHistoryController.prototype, "getAllHistory", null);
exports.LoginHistoryController = LoginHistoryController = __decorate([
    (0, common_1.Controller)('auth/login-history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [login_history_service_1.LoginHistoryService])
], LoginHistoryController);
//# sourceMappingURL=login-history.controller.js.map