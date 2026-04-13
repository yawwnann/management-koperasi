import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
