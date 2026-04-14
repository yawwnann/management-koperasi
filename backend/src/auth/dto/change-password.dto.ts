import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsStrongPassword,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password harus minimal 8 karakter' })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
