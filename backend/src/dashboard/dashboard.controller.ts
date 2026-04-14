import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

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
  async getDashboard(@Req() req: JwtRequest) {
    const isAdmin = req.user.role === 'ADMIN';
    const data = isAdmin
      ? await this.dashboardService.getAdminDashboard(req.user.sub)
      : await this.dashboardService.getUserDashboard(req.user.sub);
    return {
      success: true,
      data,
    };
  }
}
