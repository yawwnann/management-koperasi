import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';
import { LoginHistoryService } from './login-history.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private loginHistoryService: LoginHistoryService,
    private notificationsService: NotificationsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, userAgent?: string, ipAddress?: string) {
    let user: any;

    try {
      user = await this.validateUser(loginDto.email, loginDto.password);

      // Save successful login to history
      if (ipAddress && userAgent) {
        this.loginHistoryService
          .saveLogin({
            userId: user.id,
            ipAddress,
            userAgent,
            status: 'SUCCESS',
          })
          .catch((err) => console.error('Failed to save login history:', err));
      }
    } catch (error) {
      // Save failed login to history
      if (ipAddress && userAgent) {
        // Find user by email to get userId for failed attempts
        const foundUser = await this.prisma.user
          .findUnique({ where: { email: loginDto.email } })
          .catch(() => null);

        if (foundUser) {
          this.loginHistoryService
            .saveLogin({
              userId: foundUser.id,
              ipAddress,
              userAgent,
              status: 'FAILED',
              failureReason: error.message || 'Invalid credentials',
            })
            .catch((err) =>
              console.error('Failed to save failed login history:', err),
            );
        }
      }
      throw error;
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    // Generate access token
    const access_token = await this.jwtService.signAsync(payload);

    // Generate refresh token
    const { token: refresh_token } = await this.refreshTokenService.createToken(
      user.id,
      userAgent,
    );

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        angkatan: user.angkatan,
      },
    };
  }

  async refreshTokens(refreshToken: string, userAgent?: string) {
    // Validate the refresh token
    const payload = await this.refreshTokenService.validateToken(refreshToken);

    // Rotate the token (revoke old, issue new)
    const { token: newRefreshToken } =
      await this.refreshTokenService.rotateToken(
        payload.jti,
        payload.sub,
        userAgent,
      );

    // Generate new access token
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const access_token = await this.jwtService.signAsync(tokenPayload);

    return {
      access_token,
      refresh_token: newRefreshToken,
    };
  }

  async logout(tokenId: string): Promise<void> {
    await this.refreshTokenService.revokeToken(tokenId);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password lama salah');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all refresh tokens (force re-login on all devices)
    await this.refreshTokenService.revokeAllUserTokens(userId);

    // Send notification to user about password change
    await this.notificationsService.create({
      type: 'system',
      title: 'Password Berubah',
      message: 'Password akun Anda telah berhasil diubah. Jika ini bukan tindakan Anda, segera hubungi admin.',
      userId,
    });

    return { message: 'Password berhasil diubah' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        angkatan: true,
        photo: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
