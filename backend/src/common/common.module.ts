import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file synchronously before module initialization
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Try ConfigService first, fallback to process.env
        const secret =
          configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
        const expiresIn =
          configService.get<string>('JWT_EXPIRES_IN') ||
          process.env.JWT_EXPIRES_IN ||
          '15m';
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }

        return {
          secret,
          signOptions: { expiresIn: expiresIn as any },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [JwtModule],
})
export class CommonModule {}
