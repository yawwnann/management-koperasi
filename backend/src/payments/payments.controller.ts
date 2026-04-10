import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApprovePaymentDto } from './dto/approve-payment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import * as fs from 'fs';

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
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('proofImage', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.env.UPLOAD_PATH || './uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `payment-${uniqueSuffix}${extname(file.originalname).toLowerCase()}`,
          );
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const isValidExt = allowedTypes.test(
          extname(file.originalname).toLowerCase(),
        );
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && isValidExt) {
          return cb(null, true);
        }
        cb(new BadRequestException('Only image files are allowed!'), false);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async create(
    @Req() req: JwtRequest,
    @Body() createPaymentDto: CreatePaymentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Proof image is required');
    }

    createPaymentDto.nominal = parseFloat(
      createPaymentDto.nominal as unknown as string,
    );

    const payment = await this.paymentsService.create(
      req.user.sub,
      createPaymentDto,
      file.filename,
    );

    return {
      message: 'Payment submitted successfully',
      payment,
    };
  }

  @Get()
  findAll(@Req() req: JwtRequest) {
    return this.paymentsService.findAll(req.user.role, req.user.sub);
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
