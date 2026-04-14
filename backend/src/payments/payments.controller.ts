import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApprovePaymentDto } from './dto/approve-payment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

interface JwtRequest extends Request {
  user: {
    sub: string;
    role: string;
    email: string;
    name: string;
  };
}

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('proofImage'))
  async create(
    @Req() req: JwtRequest,
    @Body() createPaymentDto: CreatePaymentDto,

    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Proof image is required');
    }

    // Upload proof image to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImage(file);

    // Convert nominal to number if it comes as string
    createPaymentDto.nominal = parseFloat(
      createPaymentDto.nominal as unknown as string,
    );

    const payment = await this.paymentsService.create(
      req.user.sub,
      createPaymentDto,
      uploadResult.url, // Save the Cloudinary URL to database
    );

    return {
      message: 'Payment submitted successfully',
      payment,
    };
  }

  @Get()
  findAll(
    @Req() req: JwtRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.findAll(
      req.user.role,
      req.user.sub,
      startDate,
      endDate,
      status,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles('ADMIN')
  approve(
    @Param('id') id: string,
    @Body() approvePaymentDto: ApprovePaymentDto,
    @Req() req: JwtRequest,
  ) {
    return this.paymentsService.approve(id, approvePaymentDto, req.user.sub);
  }
}
