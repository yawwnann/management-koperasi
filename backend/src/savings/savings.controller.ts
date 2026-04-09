import { Controller, Get, Req } from '@nestjs/common';
import { SavingsService } from './savings.service';

@Controller('savings')
export class SavingsController {
  constructor(private savingsService: SavingsService) {}

  @Get('me')
  getMySavings(@Req() req) {
    return this.savingsService.getMySavings(req.user.sub);
  }

  @Get()
  getAllSavings() {
    return this.savingsService.getAllSavings();
  }
}
