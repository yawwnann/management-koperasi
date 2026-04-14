import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

interface JwtRequest extends Request {
  user: {
    sub: string;
    role: string;
    email: string;
    name: string;
  };
}

@Controller('auth/login-history')
@UseGuards(JwtAuthGuard)
export class LoginHistoryController {
  constructor(private loginHistoryService: LoginHistoryService) {}

  /**
   * Get current user's login history
   */
  @Get()
  async getUserHistory(
    @Req() req: JwtRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.loginHistoryService.getUserHistory(
      req.user.sub,
      parseInt(page as any) || 1,
      parseInt(limit as any) || 20,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get all login history (admin only)
   */
  @Get('all')
  @Roles('ADMIN')
  async getAllHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('country') country?: string,
  ) {
    const result = await this.loginHistoryService.getAllHistory(
      parseInt(page as any) || 1,
      parseInt(limit as any) || 20,
      { userId, status, country },
    );

    return {
      success: true,
      data: result,
    };
  }
}
