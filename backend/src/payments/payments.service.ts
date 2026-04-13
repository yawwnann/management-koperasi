import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApprovePaymentDto } from './dto/approve-payment.dto';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    userId: string,
    createPaymentDto: CreatePaymentDto,
    proofImage: string,
  ) {
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        nominal: new Prisma.Decimal(createPaymentDto.nominal),
        proofImage,
        description: createPaymentDto.description,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send notification to admins via WebSocket
    this.notificationsGateway.broadcastNewPayment({
      id: payment.id,
      userId: payment.userId,
      userName: payment.user.name,
      amount: Number(payment.nominal),
      status: payment.status,
    });

    // Send email notification to admins (fetch admin emails from users table)
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });

    for (const admin of admins) {
      this.emailService.sendAdminPaymentNotification(
        admin.email,
        payment.user.name,
        Number(payment.nominal),
      );
    }

    return payment;
  }

  async findAll(role: string, userId: string) {
    if (role === 'ADMIN') {
      return this.prisma.payment.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              angkatan: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approve(
    paymentId: string,
    approvePaymentDto: ApprovePaymentDto,
    adminId: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Payment has already been processed');
    }

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: approvePaymentDto.status,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If approved, update user's savings
    if (approvePaymentDto.status === 'APPROVED') {
      await this.prisma.saving.upsert({
        where: { userId: payment.userId },
        update: {
          total: {
            increment: payment.nominal,
          },
        },
        create: {
          userId: payment.userId,
          total: payment.nominal,
        },
      });
    }

    // Send notification to the user via WebSocket
    this.notificationsGateway.broadcastPaymentUpdate(updatedPayment.userId, {
      id: updatedPayment.id,
      userName: updatedPayment.user.name,
      amount: Number(updatedPayment.nominal),
      status: updatedPayment.status,
    });

    // Send email notification to the user
    this.emailService.sendPaymentNotification(
      updatedPayment.user.email,
      updatedPayment.user.name,
      Number(updatedPayment.nominal),
      updatedPayment.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    );

    return updatedPayment;
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            angkatan: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
