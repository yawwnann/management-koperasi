import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApprovePaymentDto } from './dto/approve-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

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
    });

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
