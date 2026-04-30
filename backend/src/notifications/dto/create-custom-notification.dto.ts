import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCustomNotificationDto {
  @IsString()
  @IsOptional()
  targetUserId?: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  actionUrl?: string;
}
