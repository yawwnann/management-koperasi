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
import { CreateCustomNotificationDto } from './dto/create-custom-notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { NotificationsGateway } from './notifications.gateway';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

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
    const count = await this.notificationsService.getUnreadCount(
      req.user.sub,
      req.user.role,
    );
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

  @Post('custom')
  @Roles('ADMIN')
  async createCustom(
    @Body() dto: CreateCustomNotificationDto,
  ) {
    const isBroadcast = !dto.targetUserId;
    
    // Create DB record
    const notification = await this.notificationsService.create({
      type: 'system',
      title: dto.title,
      message: dto.message,
      actionUrl: dto.actionUrl,
      userId: dto.targetUserId,
      isAdminNotification: false,
    });

    // Broadcast via WebSocket
    this.notificationsGateway.broadcastCustomNotification({
      targetUserId: dto.targetUserId,
      notification: {
        id: notification.id,
        title: dto.title,
        message: dto.message,
        actionUrl: dto.actionUrl,
      },
    });

    return {
      success: true,
      data: notification,
      message: isBroadcast 
        ? 'Notification broadcasted to all users' 
        : 'Notification sent to user',
    };
  }
}
