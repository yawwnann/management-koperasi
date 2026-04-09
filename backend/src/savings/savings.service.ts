import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavingsService {
  constructor(private prisma: PrismaService) {}

  async getMySavings(userId: string) {
    const saving = await this.prisma.saving.findUnique({
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
    });

    if (!saving) {
      throw new NotFoundException('Savings account not found');
    }

    return saving;
  }

  async getAllSavings() {
    return this.prisma.saving.findMany({
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
        total: 'desc',
      },
    });
  }
}
