import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly fromName: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.from = this.configService.get<string>(
      'EMAIL_FROM',
      'noreply@kopma.com',
    );
    this.fromName = this.configService.get<string>(
      'EMAIL_FROM_NAME',
      'KOPMA System',
    );

    // Only initialize Resend if API key is provided
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY not configured. Email service will run in mock mode.',
      );
    }
  }

  /**
   * Send email using Resend
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      // Mock mode - just log the email
      if (!this.resend) {
        this.logger.log(`[MOCK EMAIL] Would send to: ${options.to}`);
        this.logger.log(`[MOCK EMAIL] Subject: ${options.subject}`);
        this.logger.log(
          `[MOCK EMAIL] HTML: ${options.html.substring(0, 100)}...`,
        );
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
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
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

  /**
   * Send payment notification email
   */
  async sendPaymentNotification(
    to: string,
    userName: string,
    amount: number,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
  ): Promise<boolean> {
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

  /**
   * Send withdrawal notification email
   */
  async sendWithdrawalNotification(
    to: string,
    userName: string,
    amount: number,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
  ): Promise<boolean> {
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

  /**
   * Send admin notification for new payment
   */
  async sendAdminPaymentNotification(
    adminEmail: string,
    userName: string,
    amount: number,
  ): Promise<boolean> {
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

  /**
   * Send admin notification for new withdrawal
   */
  async sendAdminWithdrawalNotification(
    adminEmail: string,
    userName: string,
    amount: number,
  ): Promise<boolean> {
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
}
