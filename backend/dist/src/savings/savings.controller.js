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
exports.SavingsController = void 0;
const common_1 = require("@nestjs/common");
const savings_service_1 = require("./savings.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let SavingsController = class SavingsController {
    savingsService;
    constructor(savingsService) {
        this.savingsService = savingsService;
    }
    getMySavings(req) {
        return this.savingsService.getMySavings(req.user.sub);
    }
    getSavingsBreakdown(req) {
        return this.savingsService.getSavingsBreakdown(req.user.sub);
    }
    getSavingsChart(req) {
        return this.savingsService.getSavingsChart(req.user.sub);
    }
    getAllSavings() {
        return this.savingsService.getAllSavings();
    }
    getSavingsBreakdownByUserId(id) {
        return this.savingsService.getSavingsBreakdown(id);
    }
    getSavingsHistory(userId) {
        return this.savingsService.getSavingsHistory(userId);
    }
};
exports.SavingsController = SavingsController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "getMySavings", null);
__decorate([
    (0, common_1.Get)('me/breakdown'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "getSavingsBreakdown", null);
__decorate([
    (0, common_1.Get)('me/chart'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "getSavingsChart", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "getAllSavings", null);
__decorate([
    (0, common_1.Get)(':id/breakdown'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "getSavingsBreakdownByUserId", null);
__decorate([
    (0, common_1.Get)('history/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "getSavingsHistory", null);
exports.SavingsController = SavingsController = __decorate([
    (0, common_1.Controller)('savings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [savings_service_1.SavingsService])
], SavingsController);
//# sourceMappingURL=savings.controller.js.map