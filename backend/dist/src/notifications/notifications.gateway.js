"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    configService;
    jwtService;
    server;
    logger = new common_1.Logger(NotificationsGateway_1.name);
    connectedClients = new Map();
    constructor(configService, jwtService) {
        this.configService = configService;
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                this.logger.warn(`Connection rejected: No token provided`);
                client.disconnect();
                return;
            }
            const secret = this.configService.get('JWT_SECRET');
            const payload = await this.jwtService.verifyAsync(token, {
                secret,
            });
            this.connectedClients.set(client.id, {
                socket: client,
                role: payload.role,
                userId: payload.sub,
            });
            void client.join(`user:${payload.sub}`);
            if (payload.role === 'ADMIN') {
                void client.join('role:ADMIN');
            }
            this.logger.log(`Client connected: ${payload.name} (${payload.role})`);
        }
        catch {
            this.logger.warn(`Connection rejected: Invalid token`);
            client.disconnect();
        }
    }
    extractToken(client) {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader) {
            const [type, token] = authHeader.split(' ');
            if (type === 'Bearer' && token) {
                return token;
            }
        }
        return client.handshake.query.token || null;
    }
    handleDisconnect(client) {
        const clientInfo = this.connectedClients.get(client.id);
        if (clientInfo) {
            this.logger.log(`Client disconnected: ${clientInfo.userId} (${clientInfo.role})`);
        }
        this.connectedClients.delete(client.id);
    }
    handleSubscribe(data, client) {
        if (data.userId && data.role) {
            this.connectedClients.set(client.id, {
                socket: client,
                role: data.role,
                userId: data.userId,
            });
            void client.join(`user:${data.userId}`);
            void client.join(`role:${data.role}`);
            this.logger.log(`User ${data.userId} (${data.role}) subscribed to notifications`);
            return {
                event: 'subscribed',
                data: { userId: data.userId, role: data.role },
            };
        }
    }
    handleUnsubscribe(client) {
        const clientInfo = this.connectedClients.get(client.id);
        if (clientInfo) {
            void client.leave(`user:${clientInfo.userId}`);
            void client.leave(`role:${clientInfo.role}`);
            this.logger.log(`Client unsubscribed: ${clientInfo.userId} (${clientInfo.role})`);
        }
        this.connectedClients.delete(client.id);
        return { event: 'unsubscribed' };
    }
    sendToUser(userId, payload) {
        this.server.to(`user:${userId}`).emit('notification', payload);
        this.logger.log(`Notification sent to user ${userId}: ${payload.type}:${payload.action}`);
    }
    sendToAdmins(payload) {
        this.server.to(`role:ADMIN`).emit('notification', payload);
        this.logger.log(`Notification sent to admins: ${payload.type}:${payload.action}`);
    }
    sendToAll(payload) {
        this.server.emit('notification', payload);
        this.logger.log(`Notification sent to all: ${payload.type}:${payload.action}`);
    }
    broadcastNewPayment(paymentData) {
        const payload = {
            type: 'payment',
            action: 'created',
            data: paymentData,
        };
        this.sendToAdmins(payload);
    }
    broadcastPaymentUpdate(userId, paymentData) {
        const payload = {
            type: 'payment',
            action: paymentData.status === 'APPROVED' ? 'approved' : 'rejected',
            data: paymentData,
        };
        this.sendToUser(userId, payload);
    }
    broadcastNewWithdrawal(withdrawalData) {
        const payload = {
            type: 'withdrawal',
            action: 'created',
            data: withdrawalData,
        };
        this.sendToAdmins(payload);
    }
    broadcastWithdrawalUpdate(userId, withdrawalData) {
        const payload = {
            type: 'withdrawal',
            action: withdrawalData.status === 'APPROVED' ? 'approved' : 'rejected',
            data: withdrawalData,
        };
        this.sendToUser(userId, payload);
    }
    getConnectedCount() {
        return this.connectedClients.size;
    }
    broadcastCustomNotification(data) {
        const payload = {
            type: 'system',
            action: 'created',
            data: {
                id: data.notification.id,
                userName: 'Admin',
                status: 'INFO',
                message: data.notification.message,
            },
        };
        if (data.targetUserId) {
            this.sendToUser(data.targetUserId, payload);
        }
        else {
            this.sendToAll(payload);
        }
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleUnsubscribe", null);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: 'notifications',
    }),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map