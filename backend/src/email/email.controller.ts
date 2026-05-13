import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('test')
  async testSend(@Body() body?: { to?: string }) {
    if (!body?.to || !body.to.includes('@')) {
      throw new BadRequestException(
        'Email tujuan tidak valid. Kirim JSON: { "to": "email@example.com" }',
      );
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
}
