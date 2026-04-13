import { IsEnum, IsString } from 'class-validator';

export class ApprovePaymentDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsString()
  status!: 'APPROVED' | 'REJECTED';
}
