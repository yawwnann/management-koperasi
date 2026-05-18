import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ApproveWithdrawalDto } from './dto/approve-withdrawal.dto';
import { Roles } from '../common/decorators/roles.decorator';

interface JwtRequest extends Request {
  user: {
    sub: string;
    role: string;
    email: string;
    name: string;
  };
}

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private withdrawalsService: WithdrawalsService) {}

  @Post()
  create(@Req() req: JwtRequest, @Body() createWithdrawalDto: CreateWithdrawalDto) {
    return this.withdrawalsService.create(req.user.sub, createWithdrawalDto);
  }

  @Post('withdraw-all')
  withdrawAll(
    @Req() req: JwtRequest,
    @Body() body: { reason: string; paymentMethod?: string },
  ) {
    return this.withdrawalsService.withdrawAll(
      req.user.sub,
      body.reason,
      body.paymentMethod,
    );
  }

  @Get()
  findAll(
    @Req() req: JwtRequest,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.withdrawalsService.findAll(
      req.user.role,
      req.user.sub,
      userId,
      startDate,
      endDate,
      status,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.withdrawalsService.findOne(id, req.user.sub, req.user.role);
  }

  @Patch(':id/approve')
  @Roles('ADMIN')
  approve(
    @Param('id') id: string,
    @Body() approveWithdrawalDto: ApproveWithdrawalDto,
    @Req() req: JwtRequest,
  ) {
    return this.withdrawalsService.approve(
      id,
      approveWithdrawalDto,
      req.user.sub,
    );
  }
}
