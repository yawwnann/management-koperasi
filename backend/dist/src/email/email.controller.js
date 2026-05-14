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
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
let EmailController = class EmailController {
    emailService;
    constructor(emailService) {
        this.emailService = emailService;
    }
    async testSend(body) {
        if (!body?.to || !body.to.includes('@')) {
            throw new common_1.BadRequestException('Email tujuan tidak valid. Kirim JSON: { "to": "email@example.com" }');
        }
        const result = await this.emailService.sendEmail({
            to: body.to,
            subject: 'Test Email dari KOPMA',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6;">Test Email KOPMA</h1>
          <p>Halo,</p>
          <p>Email ini adalah email testing untuk memastikan konfigurasi email service KOPMA berjalan dengan baik.</p>
          <p>Jika Anda menerima email ini, maka konfigurasi email sudah berhasil! ✅</p>
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f9fafb;"><strong>Waktu</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f9fafb;"><strong>Pengirim</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">Sistem KOPMA</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Salam,<br>Tim KOPMA</p>
        </div>
      `,
        });
        if (result) {
            return {
                success: true,
                message: `Email berhasil dikirim ke ${body.to}`,
            };
        }
        return {
            success: false,
            message: `Gagal mengirim email ke ${body.to}. Cek log untuk detail error.`,
        };
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "testSend", null);
exports.EmailController = EmailController = __decorate([
    (0, common_1.Controller)('email'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map