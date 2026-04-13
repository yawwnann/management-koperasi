export interface AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    photo?: string;
    angkatan?: string;
  };
}

export interface AuthWithRefreshResponseDto extends AuthResponseDto {
  refresh_token: string;
}

export interface RefreshTokensResponseDto {
  access_token: string;
  refresh_token: string;
}
