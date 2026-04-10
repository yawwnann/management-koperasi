import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ApproveWithdrawalDto } from './dto/approve-withdrawal.dto';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

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
    });

    return withdrawal;
  }

  async findAll(role: string, userId: string) {
    if (role === 'ADMIN') {
      return this.prisma.withdrawal.findMany({
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

    // Update withdrawal status
    const updatedWithdrawal = await this.prisma.withdrawal.update({
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
      await this.prisma.saving.update({
        where: { userId: withdrawal.userId },
        data: {
          total: {
            decrement: withdrawal.nominal,
          },
        },
      });
    }

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
