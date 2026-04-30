import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface NotificationPayload {
  type: 'payment' | 'withdrawal' | 'system';
  action: 'created' | 'approved' | 'rejected';
  data: {
    id: string;
    userName: string;
    amount?: number;
    status: string;
    message?: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients: Map<
    string,
    { socket: Socket; role: string; userId: string }
  > = new Map();

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * Handle client connection with JWT verification
   */
  async handleConnection(client: Socket) {
    try {
      // Get token from handshake auth or query params
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      // Store authenticated client
      this.connectedClients.set(client.id, {
        socket: client,
        role: payload.role,
        userId: payload.sub,
      });

      // Auto-join user room
      void client.join(`user:${payload.sub}`);
      if (payload.role === 'ADMIN') {
        void client.join('role:ADMIN');
      }

      this.logger.log(`Client connected: ${payload.name} (${payload.role})`);
    } catch {
      this.logger.warn(`Connection rejected: Invalid token`);
      client.disconnect();
    }
  }

  /**
   * Extract JWT token from handshake
   */
  private extractToken(client: Socket): string | null {
    // Try auth header first (Bearer token)
    const authHeader = client.handshake.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    // Fallback to query param (for simple clients)
    return (client.handshake.query.token as string) || null;
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(
        `Client disconnected: ${clientInfo.userId} (${clientInfo.role})`,
      );
    }
    this.connectedClients.delete(client.id);
  }

  /**
   * Client subscribes to notifications
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { userId: string; role: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.userId && data.role) {
      this.connectedClients.set(client.id, {
        socket: client,
        role: data.role,
        userId: data.userId,
      });
      void client.join(`user:${data.userId}`);
      void client.join(`role:${data.role}`);

      this.logger.log(
        `User ${data.userId} (${data.role}) subscribed to notifications`,
      );

      return {
        event: 'subscribed',
        data: { userId: data.userId, role: data.role },
      };
    }
  }

  /**
   * Client unsubscribes from notifications
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      void client.leave(`user:${clientInfo.userId}`);
      void client.leave(`role:${clientInfo.role}`);
      this.logger.log(
        `Client unsubscribed: ${clientInfo.userId} (${clientInfo.role})`,
      );
    }
    this.connectedClients.delete(client.id);
    return { event: 'unsubscribed' };
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId: string, payload: NotificationPayload) {
    this.server.to(`user:${userId}`).emit('notification', payload);
    this.logger.log(
      `Notification sent to user ${userId}: ${payload.type}:${payload.action}`,
    );
  }

  /**
   * Send notification to all admins
   */
  sendToAdmins(payload: NotificationPayload) {
    this.server.to(`role:ADMIN`).emit('notification', payload);
    this.logger.log(
      `Notification sent to admins: ${payload.type}:${payload.action}`,
    );
  }

  /**
   * Send notification to all connected clients
   */
  sendToAll(payload: NotificationPayload) {
    this.server.emit('notification', payload);
    this.logger.log(
      `Notification sent to all: ${payload.type}:${payload.action}`,
    );
  }

  /**
   * Broadcast new payment created (to admins)
   */
  broadcastNewPayment(paymentData: {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    status: string;
  }) {
    const payload: NotificationPayload = {
      type: 'payment',
      action: 'created',
      data: paymentData,
    };
    this.sendToAdmins(payload);
  }

  /**
   * Broadcast payment status update (to user)
   */
  broadcastPaymentUpdate(
    userId: string,
    paymentData: {
      id: string;
      userName: string;
      amount: number;
      status: string;
    },
  ) {
    const payload: NotificationPayload = {
      type: 'payment',
      action: paymentData.status === 'APPROVED' ? 'approved' : 'rejected',
      data: paymentData,
    };
    this.sendToUser(userId, payload);
  }

  /**
   * Broadcast new withdrawal created (to admins)
   */
  broadcastNewWithdrawal(withdrawalData: {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    status: string;
  }) {
    const payload: NotificationPayload = {
      type: 'withdrawal',
      action: 'created',
      data: withdrawalData,
    };
    this.sendToAdmins(payload);
  }

  /**
   * Broadcast withdrawal status update (to user)
   */
  broadcastWithdrawalUpdate(
    userId: string,
    withdrawalData: {
      id: string;
      userName: string;
      amount: number;
      status: string;
    },
  ) {
    const payload: NotificationPayload = {
      type: 'withdrawal',
      action: withdrawalData.status === 'APPROVED' ? 'approved' : 'rejected',
      data: withdrawalData,
    };
    this.sendToUser(userId, payload);
  }

  /**
   * Get count of connected clients
   */
  getConnectedCount() {
    return this.connectedClients.size;
  }

  /**
   * Broadcast custom notification
   */
  broadcastCustomNotification(data: {
    targetUserId?: string;
    notification: {
      id: string;
      title: string;
      message: string;
      actionUrl?: string;
    };
  }) {
    const payload: NotificationPayload = {
      type: 'system',
      action: 'created',
      data: {
        id: data.notification.id,
        userName: 'Admin', // System/Admin sender
        status: 'INFO',
        message: data.notification.message,
      },
    };

    if (data.targetUserId) {
      this.sendToUser(data.targetUserId, payload);
    } else {
      this.sendToAll(payload);
    }
  }
}
