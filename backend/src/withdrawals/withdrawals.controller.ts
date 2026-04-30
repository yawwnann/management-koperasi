import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ApproveWithdrawalDto } from './dto/approve-withdrawal.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private withdrawalsService: WithdrawalsService) {}

  @Post()
  create(@Req() req, @Body() createWithdrawalDto: CreateWithdrawalDto) {
    return this.withdrawalsService.create(req.user.sub, createWithdrawalDto);
  }

  @Post('withdraw-all')
  withdrawAll(
    @Req() req,
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
    @Req() req,
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
  findOne(@Param('id') id: string) {
    return this.withdrawalsService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles('ADMIN')
  approve(
    @Param('id') id: string,
    @Body() approveWithdrawalDto: ApproveWithdrawalDto,
    @Req() req,
  ) {
    return this.withdrawalsService.approve(
      id,
      approveWithdrawalDto,
      req.user.sub,
    );
  }
}
