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
exports.CreateWithdrawalDto = exports.SavingType = exports.WithdrawalPaymentMethod = void 0;
const class_validator_1 = require("class-validator");
var WithdrawalPaymentMethod;
(function (WithdrawalPaymentMethod) {
    WithdrawalPaymentMethod["CASH"] = "Cash";
    WithdrawalPaymentMethod["BANK_TRANSFER"] = "BankTransfer";
})(WithdrawalPaymentMethod || (exports.WithdrawalPaymentMethod = WithdrawalPaymentMethod = {}));
var SavingType;
(function (SavingType) {
    SavingType["POKOK"] = "Pokok";
    SavingType["WAJIB"] = "Wajib";
    SavingType["SUKARELA"] = "Sukarela";
})(SavingType || (exports.SavingType = SavingType = {}));
class CreateWithdrawalDto {
    nominal;
    reason;
    savingType;
    paymentMethod;
}
exports.CreateWithdrawalDto = CreateWithdrawalDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateWithdrawalDto.prototype, "nominal", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWithdrawalDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SavingType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWithdrawalDto.prototype, "savingType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(WithdrawalPaymentMethod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWithdrawalDto.prototype, "paymentMethod", void 0);
//# sourceMappingURL=create-withdrawal.dto.js.map