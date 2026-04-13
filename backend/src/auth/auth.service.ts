import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
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

  async login(loginDto: LoginDto, userAgent?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

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
