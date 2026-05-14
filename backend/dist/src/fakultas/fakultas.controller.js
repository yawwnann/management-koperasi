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
exports.FakultasController = void 0;
const common_1 = require("@nestjs/common");
const fakultas_service_1 = require("./fakultas.service");
const public_decorator_1 = require("../common/decorators/public.decorator");
let FakultasController = class FakultasController {
    fakultasService;
    constructor(fakultasService) {
        this.fakultasService = fakultasService;
    }
    getAllFakultas() {
        return {
            success: true,
            data: this.fakultasService.getAllFakultas(),
        };
    }
    getFakultasList() {
        return {
            success: true,
            data: this.fakultasService.getFakultasList(),
        };
    }
    getJurusanByFakultas(fakultas) {
        if (!fakultas) {
            return {
                success: false,
                error: {
                    message: 'Fakultas parameter is required',
                    statusCode: 400,
                },
            };
        }
        return {
            success: true,
            data: this.fakultasService.getJurusanByFakultas(fakultas),
        };
    }
};
exports.FakultasController = FakultasController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FakultasController.prototype, "getAllFakultas", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FakultasController.prototype, "getFakultasList", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('jurusan'),
    __param(0, (0, common_1.Query)('fakultas')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FakultasController.prototype, "getJurusanByFakultas", null);
exports.FakultasController = FakultasController = __decorate([
    (0, common_1.Controller)('fakultas'),
    __metadata("design:paramtypes", [fakultas_service_1.FakultasService])
], FakultasController);
//# sourceMappingURL=fakultas.controller.js.map