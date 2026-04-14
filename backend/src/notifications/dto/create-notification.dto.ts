import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsEnum(['payment', 'withdrawal', 'system'])
  type!: 'payment' | 'withdrawal' | 'system';

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  isAdminNotification?: boolean;
}
