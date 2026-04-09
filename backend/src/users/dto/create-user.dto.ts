import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEnum(['ANGGOTA', 'ADMIN'])
  @IsOptional()
  role?: 'ANGGOTA' | 'ADMIN';

  @IsString()
  @IsOptional()
  angkatan?: string;
}
