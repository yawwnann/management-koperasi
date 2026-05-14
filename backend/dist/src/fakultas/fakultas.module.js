"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakultasModule = void 0;
const common_1 = require("@nestjs/common");
const fakultas_controller_1 = require("./fakultas.controller");
const fakultas_service_1 = require("./fakultas.service");
let FakultasModule = class FakultasModule {
};
exports.FakultasModule = FakultasModule;
exports.FakultasModule = FakultasModule = __decorate([
    (0, common_1.Module)({
        controllers: [fakultas_controller_1.FakultasController],
        providers: [fakultas_service_1.FakultasService],
        exports: [fakultas_service_1.FakultasService],
    })
], FakultasModule);
//# sourceMappingURL=fakultas.module.js.map