import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private configService;
    private jwtService;
    server: Server;
    private readonly logger;
    private connectedClients;
    constructor(configService: ConfigService, jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    private extractToken;
    handleDisconnect(client: Socket): void;
    handleSubscribe(data: {
        userId: string;
        role: string;
    }, client: Socket): {
        event: string;
        data: {
            userId: string;
            role: string;
        };
    } | undefined;
    handleUnsubscribe(client: Socket): {
        event: string;
    };
    sendToUser(userId: string, payload: NotificationPayload): void;
    sendToAdmins(payload: NotificationPayload): void;
    sendToAll(payload: NotificationPayload): void;
    broadcastNewPayment(paymentData: {
        id: string;
        userId: string;
        userName: string;
        amount: number;
        status: string;
    }): void;
    broadcastPaymentUpdate(userId: string, paymentData: {
        id: string;
        userName: string;
        amount: number;
        status: string;
    }): void;
    broadcastNewWithdrawal(withdrawalData: {
        id: string;
        userId: string;
        userName: string;
        amount: number;
        status: string;
    }): void;
    broadcastWithdrawalUpdate(userId: string, withdrawalData: {
        id: string;
        userName: string;
        amount: number;
        status: string;
    }): void;
    getConnectedCount(): number;
    broadcastCustomNotification(data: {
        targetUserId?: string;
        notification: {
            id: string;
            title: string;
            message: string;
            actionUrl?: string;
        };
    }): void;
}
