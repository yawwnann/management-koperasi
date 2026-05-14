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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let EmailService = EmailService_1 = class EmailService {
    configService;
    resend;
    from;
    fromName;
    logger = new common_1.Logger(EmailService_1.name);
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('RESEND_API_KEY');
        this.from = this.configService.get('EMAIL_FROM', 'noreply@kopma.com');
        this.fromName = this.configService.get('EMAIL_FROM_NAME', 'KOPMA System');
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
        }
        else {
            this.logger.warn('RESEND_API_KEY not configured. Email service will run in mock mode.');
        }
    }
    async sendEmail(options) {
        try {
            if (!this.resend) {
                this.logger.log(`[MOCK EMAIL] Would send to: ${options.to}`);
                this.logger.log(`[MOCK EMAIL] Subject: ${options.subject}`);
                this.logger.log(`[MOCK EMAIL] HTML: ${options.html.substring(0, 100)}...`);
                return true;
            }
            const { data, error } = await this.resend.emails.send({
                from: `${this.fromName} <${this.from}>`,
                to: [options.to],
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            if (error) {
                this.logger.error(`Failed to send email: ${error.message}`);
                return false;
            }
            this.logger.log(`Email sent successfully to ${options.to}: ${data?.id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error sending email: ${error.message}`, error.stack);
            return false;
        }
    }
    async sendWelcomeEmail(to, name) {
        const subject = 'Selamat Datang di KOPMA!';
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Selamat Datang, ${name}!</h1>
        <p>Terima kasih telah bergabung dengan KOPMA (Koperasi Digital Mahasiswa).</p>
        <p>Anda sekarang dapat:</p>
        <ul>
          <li>Melakukan simpanan pokok, wajib, dan sukarela</li>
          <li>Mengajukan penarikan dana</li>
          <li>Memantau saldo dan riwayat transaksi</li>
        </ul>
        <p>Jika ada pertanyaan, silakan hubungi administrator KOPMA.</p>
        <p style="margin-top: 20px;">Salam,<br>Tim KOPMA</p>
      </div>
    `;
        const text = `Selamat Datang, ${name}! Terima kasih telah bergabung dengan KOPMA.`;
        return this.sendEmail({ to, subject, html, text });
    }
    async sendPaymentNotification(to, userName, amount, status) {
        const statusText = {
            PENDING: 'sedang menunggu verifikasi',
            APPROVED: 'telah disetujui',
            REJECTED: 'ditolak',
        };
        const statusColor = {
            PENDING: '#f59e0b',
            APPROVED: '#10b981',
            REJECTED: '#ef4444',
        };
        const subject = `Pembayaran ${statusText[status]} - KOPMA`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${statusColor[status]};">Pembayaran ${statusText[status]}</h1>
        <p>Halo ${userName},</p>
        <p>Pembayaran Anda sebesar <strong>Rp ${amount.toLocaleString('id-ID')}</strong> ${statusText[status]}.</p>
        ${status === 'APPROVED' ? '<p>Saldo Anda telah diperbarui.</p>' : ''}
        ${status === 'PENDING' ? '<p>Pembayaran akan diverifikasi oleh administrator dalam waktu 1x24 jam.</p>' : ''}
        ${status === 'REJECTED' ? '<p>Silakan hubungi administrator untuk informasi lebih lanjut.</p>' : ''}
        <p style="margin-top: 20px;">Salam,<br>Tim KOPMA</p>
      </div>
    `;
        return this.sendEmail({ to, subject, html });
    }
    async sendWithdrawalNotification(to, userName, amount, status) {
        const statusText = {
            PENDING: 'sedang menunggu verifikasi',
            APPROVED: 'telah disetujui',
            REJECTED: 'ditolak',
        };
        const statusColor = {
            PENDING: '#f59e0b',
            APPROVED: '#10b981',
            REJECTED: '#ef4444',
        };
        const subject = `Penarikan ${statusText[status]} - KOPMA`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${statusColor[status]};">Penarikan ${statusText[status]}</h1>
        <p>Halo ${userName},</p>
        <p>Penarikan dana Anda sebesar <strong>Rp ${amount.toLocaleString('id-ID')}</strong> ${statusText[status]}.</p>
        ${status === 'APPROVED' ? '<p>Dana akan ditransfer ke rekening Anda dalam waktu 1-3 hari kerja.</p>' : ''}
        ${status === 'PENDING' ? '<p>Penarikan akan diverifikasi oleh administrator dalam waktu 1x24 jam.</p>' : ''}
        ${status === 'REJECTED' ? '<p>Silakan hubungi administrator untuk informasi lebih lanjut.</p>' : ''}
        <p style="margin-top: 20px;">Salam,<br>Tim KOPMA</p>
      </div>
    `;
        return this.sendEmail({ to, subject, html });
    }
    async sendAdminPaymentNotification(adminEmail, userName, amount) {
        const subject = 'Pembayaran Baru Menunggu Verifikasi - KOPMA';
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Pembayaran Baru</h1>
        <p>Ada pembayaran baru yang menunggu verifikasi:</p>
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9fafb;"><strong>Anggota</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9fafb;"><strong>Jumlah</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">Rp ${amount.toLocaleString('id-ID')}</td>
          </tr>
        </table>
        <p>Silakan login ke dashboard admin untuk memverifikasi pembayaran ini.</p>
        <p style="margin-top: 20px;">Salam,<br>Sistem KOPMA</p>
      </div>
    `;
        return this.sendEmail({ to: adminEmail, subject, html });
    }
    async sendAdminWithdrawalNotification(adminEmail, userName, amount) {
        const subject = 'Penarikan Baru Menunggu Verifikasi - KOPMA';
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Penarikan Baru</h1>
        <p>Ada penarikan baru yang menunggu verifikasi:</p>
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9fafb;"><strong>Anggota</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9fafb;"><strong>Jumlah</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">Rp ${amount.toLocaleString('id-ID')}</td>
          </tr>
        </table>
        <p>Silakan login ke dashboard admin untuk memverifikasi penarikan ini.</p>
        <p style="margin-top: 20px;">Salam,<br>Sistem KOPMA</p>
      </div>
    `;
        return this.sendEmail({ to: adminEmail, subject, html });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map