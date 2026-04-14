import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(['ANGGOTA', 'ADMIN'])
  @IsOptional()
  role?: 'ANGGOTA' | 'ADMIN';

  @IsString()
  @IsOptional()
  angkatan?: string;

  @IsString()
  @IsOptional()
  nim?: string; // Nomor Induk Mahasiswa

  @IsString()
  @IsOptional()
  fakultas?: string; // Fakultas

  @IsString()
  @IsOptional()
  prodi?: string; // Program Studi/Jurusan

  @IsDateString()
  @IsOptional()
  birthDate?: string; // Tanggal Lahir (YYYY-MM-DD)

  @IsString()
  @IsOptional()
  address?: string; // Alamat
}
