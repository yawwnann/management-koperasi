import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}

@Injectable()
export class RefreshTokenService {
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Try ConfigService first, fallback to process.env
    const secret =
      this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
      process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new Error(
        'REFRESH_TOKEN_SECRET is not defined in environment variables',
      );
    }
    this.refreshTokenSecret = secret;
    this.refreshTokenExpiresIn =
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') ||
      process.env.REFRESH_TOKEN_EXPIRES_IN ||
      '30d';
  }

  /**
   * Generate a new refresh token and store it in the database
   */
  async createToken(
    userId: string,
    userAgent?: string,
  ): Promise<{ token: string; tokenId: string }> {
    const tokenId = crypto.randomUUID();

    // Sign the refresh token with separate secret
    const token = this.jwtService.sign(
      {
        sub: userId,
        jti: tokenId,
      },
      {
        secret: this.refreshTokenSecret,
        expiresIn: '30d',
      },
    );

    // Calculate expiration time
    const expiresAt = new Date();
    const expiresInMs = this.parseExpiresIn(this.refreshTokenExpiresIn);
    expiresAt.setTime(expiresAt.getTime() + expiresInMs);

    // Store in database
    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        token: await this.hashToken(token),
        userId,
        userAgent: userAgent || null,
        expiresAt,
      },
    });

    return { token, tokenId };
  }

  /**
   * Validate a refresh token by checking database and token integrity
   */
  async validateToken(token: string): Promise<RefreshTokenPayload> {
    // Verify the JWT signature and expiration
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.refreshTokenSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find the token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Check if token matches (prevent tampering)
    const hashedInputToken = await this.hashToken(token);
    if (storedToken.token !== hashedInputToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is revoked
    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Check for token rotation anomaly (detect token theft)
    if (storedToken.replacedByTokenId) {
      const newToken = await this.prisma.refreshToken.findUnique({
        where: { id: storedToken.replacedByTokenId },
      });

      // If the replacement token is also revoked, this is a token reuse attack
      if (newToken?.revokedAt) {
        // Security breach detected - revoke entire token chain
        await this.revokeTokenFamily(storedToken.id);
        throw new UnauthorizedException(
          'Security violation: Token reuse detected. All tokens have been revoked. Please login again.',
        );
      }
    }

    return payload;
  }

  /**
   * Revoke a specific refresh token
   */
  async revokeToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Rotate refresh token: revoke old one and issue new one
   * This provides enhanced security by limiting token lifetime
   */
  async rotateToken(
    oldTokenId: string,
    userId: string,
    userAgent?: string,
  ): Promise<{ token: string; tokenId: string }> {
    // Mark old token as replaced
    const { token, tokenId } = await this.createToken(userId, userAgent);

    await this.prisma.refreshToken.update({
      where: { id: oldTokenId },
      data: { replacedByTokenId: tokenId },
    });

    return { token, tokenId };
  }

  /**
   * Get all active (non-revoked, non-expired) tokens for a user
   */
  async getUserTokens(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Revoke entire token family (for security breach response)
   */
  private async revokeTokenFamily(tokenId: string): Promise<void> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
      include: {
        nextToken: true,
        replacedByToken: true,
      },
    });

    if (!token) return;

    // Revoke current token
    await this.revokeToken(tokenId);

    // Revoke next token if exists
    if (token.nextToken) {
      await this.revokeToken(token.nextToken.id);
    }

    // Revoke replaced token if exists
    if (token.replacedByToken) {
      await this.revokeToken(token.replacedByToken.id);
    }

    // Find and revoke all tokens in the same chain (same userId)
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: token.userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Hash a token for secure storage
   */
  private async hashToken(token: string): Promise<string> {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    return hash;
  }

  /**
   * Parse expires_in string to milliseconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expires_in format: ${expiresIn}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unknown time unit: ${unit}`);
    }
  }
}
