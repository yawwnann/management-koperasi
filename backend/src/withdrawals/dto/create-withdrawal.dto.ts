import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber()
  @IsNotEmpty()
  nominal: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
