import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

interface JwtRequest extends Request {
  user: {
    sub: string;
    role: string;
    email: string;
    name: string;
  };
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @Roles('ADMIN')
  async getDashboard(@Req() req: JwtRequest) {
    const data = await this.dashboardService.getAdminDashboard(req.user.sub);
    return {
      success: true,
      data,
    };
  }
}
