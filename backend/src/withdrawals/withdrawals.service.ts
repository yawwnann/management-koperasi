import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ApproveWithdrawalDto } from './dto/approve-withdrawal.dto';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(userId: string, createWithdrawalDto: CreateWithdrawalDto) {
    // Check user's savings balance
    const saving = await this.prisma.saving.findUnique({
      where: { userId },
    });

    if (!saving) {
      throw new BadRequestException('Savings account not found');
    }

    if (
      saving.total.lessThan(new Prisma.Decimal(createWithdrawalDto.nominal))
    ) {
      throw new BadRequestException('Insufficient balance');
    }

    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        userId,
        nominal: new Prisma.Decimal(createWithdrawalDto.nominal),
        reason: createWithdrawalDto.reason,
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

    // Notify Admins via WebSocket
    this.notificationsGateway.broadcastNewWithdrawal({
      id: withdrawal.id,
      userId: withdrawal.userId,
      userName: withdrawal.user.name,
      amount: Number(withdrawal.nominal),
      status: withdrawal.status,
    });

    // Notify Admins via Email
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });

    for (const admin of admins) {
      this.emailService.sendAdminWithdrawalNotification(
        admin.email,
        withdrawal.user.name,
        Number(withdrawal.nominal),
      );
    }

    return withdrawal;
  }

  async findAll(
    role: string,
    userId: string,
    startDate?: string,
    endDate?: string,
    status?: string,
  ) {
    // Build where clause
    const where: Prisma.WithdrawalWhereInput = {};

    // Add user filter
    if (role !== 'ADMIN') {
      where.userId = userId;
    }

    // Add date filters
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Add status filter
    if (status) {
      where.status = status as any;
    }

    if (role === 'ADMIN') {
      return this.prisma.withdrawal.findMany({
        where,
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

    return this.prisma.withdrawal.findMany({
      where,
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
    withdrawalId: string,
    approveWithdrawalDto: ApproveWithdrawalDto,
    adminId: string,
  ) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== 'PENDING') {
      throw new BadRequestException('Withdrawal has already been processed');
    }

    // Update withdrawal status and decrement savings in a transaction
    const updatedWithdrawal = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: approveWithdrawalDto.status,
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

      // If approved, decrease user's savings
      if (approveWithdrawalDto.status === 'APPROVED') {
        await tx.saving.update({
          where: { userId: withdrawal.userId },
          data: {
            total: {
              decrement: withdrawal.nominal,
            },
          },
        });
      }

      return updated;
    });

    // Notify User via WebSocket
    this.notificationsGateway.broadcastWithdrawalUpdate(
      updatedWithdrawal.userId,
      {
        id: updatedWithdrawal.id,
        userName: updatedWithdrawal.user.name,
        amount: Number(updatedWithdrawal.nominal),
        status: updatedWithdrawal.status,
      },
    );

    // Notify User via Email
    this.emailService.sendWithdrawalNotification(
      updatedWithdrawal.user.email,
      updatedWithdrawal.user.name,
      Number(updatedWithdrawal.nominal),
      updatedWithdrawal.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    );

    return updatedWithdrawal;
  }

  async findOne(id: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
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

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    return withdrawal;
  }
}
