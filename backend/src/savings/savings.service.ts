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

  async getSavingsBreakdown(userId: string) {
    const saving = await this.prisma.saving.findUnique({
      where: { userId },
    });

    if (!saving) {
      throw new NotFoundException('Savings account not found');
    }

    // Get all approved payments for this user
    const approvedPayments = await this.prisma.payment.findMany({
      where: { userId, status: 'APPROVED' },
      select: { nominal: true, description: true },
    });

    // Get all approved withdrawals for this user
    const approvedWithdrawals = await this.prisma.withdrawal.findMany({
      where: { userId, status: 'APPROVED' },
      select: { nominal: true, savingType: true },
    });

    // Calculate breakdown by type
    const breakdown = {
      pokok: 0,
      wajib: 0,
      sukarela: 0,
    };

    approvedPayments.forEach((payment) => {
      const desc = (payment.description || '').toLowerCase();
      const amount = Number(payment.nominal);

      if (desc.includes('pokok')) {
        breakdown.pokok += amount;
      } else if (desc.includes('wajib')) {
        breakdown.wajib += amount;
      } else {
        breakdown.sukarela += amount;
      }
    });

    // Subtract approved withdrawals by type
    approvedWithdrawals.forEach((withdrawal) => {
      const amount = Number(withdrawal.nominal);
      const type = withdrawal.savingType.toLowerCase();

      if (type === 'pokok') {
        breakdown.pokok -= amount;
      } else if (type === 'wajib') {
        breakdown.wajib -= amount;
      } else {
        breakdown.sukarela -= amount;
      }
    });

    return {
      total: Number(saving.total),
      breakdown,
      details: [
        { type: 'Simpanan Pokok', amount: breakdown.pokok },
        { type: 'Simpanan Wajib', amount: breakdown.wajib },
        { type: 'Simpanan Sukarela', amount: breakdown.sukarela },
      ],
    };
  }

  async getSavingsChart(userId: string) {
    const months: string[] = [];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];

    // Generate last 6 months labels
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
    }

    // Get all approved payments for calculating monthly accumulation
    const approvedPayments = await this.prisma.payment.findMany({
      where: { userId, status: 'APPROVED' },
      select: { nominal: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Get all withdrawals for this user
    const withdrawals = await this.prisma.withdrawal.findMany({
      where: { userId, status: 'APPROVED' },
      select: { nominal: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate cumulative savings by month
    const chartData = months.map((label, index) => {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - (5 - index));
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();

      // Sum all approved payments up to this month
      let cumulativeSavings = 0;

      approvedPayments.forEach((payment) => {
        const paymentDate = new Date(payment.createdAt);
        if (
          paymentDate.getFullYear() < targetYear ||
          (paymentDate.getFullYear() === targetYear &&
            paymentDate.getMonth() <= targetMonth)
        ) {
          cumulativeSavings += Number(payment.nominal);
        }
      });

      // Subtract approved withdrawals up to this month
      withdrawals.forEach((withdrawal) => {
        const withdrawalDate = new Date(withdrawal.createdAt);
        if (
          withdrawalDate.getFullYear() < targetYear ||
          (withdrawalDate.getFullYear() === targetYear &&
            withdrawalDate.getMonth() <= targetMonth)
        ) {
          cumulativeSavings -= Number(withdrawal.nominal);
        }
      });

      return {
        label,
        balance: Math.max(0, cumulativeSavings),
      };
    });

    return {
      labels: months,
      data: chartData,
    };
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
