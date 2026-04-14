import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UAParser } from 'ua-parser-js';
import * as geoip from 'geoip-lite';

export interface LoginHistoryData {
  userId: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED';
  failureReason?: string;
}

export interface ParsedDeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceBrand: string | null;
  deviceModel: string | null;
}

export interface LocationInfo {
  country: string;
  city: string;
  region: string;
}

@Injectable()
export class LoginHistoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Save login attempt to history
   */
  async saveLogin(data: LoginHistoryData) {
    const deviceInfo = this.parseUserAgent(data.userAgent);
    const locationInfo = this.getLocationFromIp(data.ipAddress);

    return this.prisma.loginHistory.create({
      data: {
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        os: deviceInfo.os,
        osVersion: deviceInfo.osVersion,
        device: deviceInfo.device,
        deviceBrand: deviceInfo.deviceBrand,
        deviceModel: deviceInfo.deviceModel,
        country: locationInfo.country,
        city: locationInfo.city,
        region: locationInfo.region,
        status: data.status,
        failureReason: data.failureReason || null,
      },
    });
  }

  /**
   * Get login history for a specific user
   */
  async getUserHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.loginHistory.count({ where: { userId } }),
    ]);

    return {
      history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all login history (admin only)
   */
  async getAllHistory(
    page: number = 1,
    limit: number = 20,
    filters?: {
      userId?: string;
      status?: string;
      country?: string;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.status) where.status = filters.status;
    if (filters?.country) where.country = filters.country;

    const [history, total] = await Promise.all([
      this.prisma.loginHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.loginHistory.count({ where }),
    ]);

    return {
      history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Parse user agent string to extract device info
   */
  private parseUserAgent(userAgent: string): ParsedDeviceInfo {
    const parser = new UAParser();
    parser.setUA(userAgent);
    const result = parser.getResult();

    return {
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || '',
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || '',
      device: this.getDeviceType(result),
      deviceBrand: result.device.vendor || null,
      deviceModel: result.device.model || null,
    };
  }

  /**
   * Determine device type (Desktop, Mobile, Tablet)
   */
  private getDeviceType(result: ReturnType<UAParser['getResult']>): string {
    if (result.device.type === 'tablet') return 'Tablet';
    if (result.device.type === 'mobile') return 'Mobile';
    if (result.device.type === 'smarttv') return 'Smart TV';
    if (result.device.type === 'wearable') return 'Wearable';
    if (result.device.type === 'console') return 'Console';
    return 'Desktop';
  }

  /**
   * Get location information from IP address
   */
  private getLocationFromIp(ipAddress: string): LocationInfo {
    // Handle localhost/private IPs
    if (
      ipAddress === '127.0.0.1' ||
      ipAddress === '::1' ||
      ipAddress === 'localhost' ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.')
    ) {
      return {
        country: 'Local Network',
        city: 'Local',
        region: 'Local',
      };
    }

    const geo = geoip.lookup(ipAddress);

    if (geo) {
      return {
        country: geo.country || 'Unknown',
        city: geo.city || 'Unknown',
        region: geo.region || 'Unknown',
      };
    }

    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
    };
  }
}
