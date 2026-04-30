import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ApproveWithdrawalDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsString()
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
