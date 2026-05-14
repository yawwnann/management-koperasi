export declare class CreateUserDto {
    name: string;
    email: string;
    password?: string;
    role?: 'ANGGOTA' | 'ADMIN';
    angkatan?: string;
    nim?: string;
    fakultas?: string;
    prodi?: string;
    birthDate?: string;
    address?: string;
    phone?: string;
    isActive?: boolean;
}
