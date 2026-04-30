import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  nominal: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['Cash', 'QRIS', 'BankTransfer'])
  @IsNotEmpty()
  paymentMethod: string;
}
