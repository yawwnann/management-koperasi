import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('savings')
@UseGuards(JwtAuthGuard)
export class SavingsController {
  constructor(private savingsService: SavingsService) {}

  @Get('me')
  getMySavings(@Req() req) {
    return this.savingsService.getMySavings(req.user.sub);
  }

  @Get('me/breakdown')
  getSavingsBreakdown(@Req() req) {
    return this.savingsService.getSavingsBreakdown(req.user.sub);
  }

  @Get('me/chart')
  getSavingsChart(@Req() req) {
    return this.savingsService.getSavingsChart(req.user.sub);
  }

  @Get()
  getAllSavings() {
    return this.savingsService.getAllSavings();
  }
}
