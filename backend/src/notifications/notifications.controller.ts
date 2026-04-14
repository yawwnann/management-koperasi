import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Request() req: { user: { sub: string; role: string } },
  ) {
    const notifications = await this.notificationsService.getUserNotifications(
      req.user.sub,
      req.user.role,
    );
    return {
      success: true,
      data: notifications,
    };
  }

  @Get('unread-count')
  async getUnreadCount(
    @Request() req: { user: { sub: string; role: string } },
  ) {
    const count = await (this.notificationsService.getUnreadCount(
      req.user.sub,
      req.user.role,
    ) as Promise<number>);
    return {
      success: true,
      data: { count },
    };
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string) {
    await this.notificationsService.markAsRead(id);
    return {
      success: true,
      message: 'Notification marked as read',
    };
  }

  @Post('read-all')
  async markAllAsRead(@Request() req: { user: { sub: string; role: string } }) {
    await this.notificationsService.markAllAsRead(req.user.sub, req.user.role);
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  // Internal endpoint for creating notifications (should be called from other services)
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationsService.create(
      createNotificationDto,
    );
    return {
      success: true,
      data: notification,
    };
  }
}
