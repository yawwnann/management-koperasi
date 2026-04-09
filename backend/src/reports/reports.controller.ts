import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reports')
@Roles('ADMIN')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('daily')
  getDailyReport(@Query('date') date?: string) {
    return this.reportsService.getDailyReport(date);
  }

  @Get('angkatan')
  getAngkatanReport(@Query('angkatan') angkatan?: string) {
    return this.reportsService.getAngkatanReport(angkatan);
  }

  @Get('summary')
  getSummary() {
    return this.reportsService.getSummary();
  }
}
