import { IsEnum, IsString } from 'class-validator';

export class ApproveWithdrawalDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsString()
  status: 'APPROVED' | 'REJECTED';
}
