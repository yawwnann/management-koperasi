import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getDailyReport(date?: string): Promise<{
        date: Date;
        payments: {
            data: ({
                user: {
                    email: string;
                    name: string;
                    angkatan: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                userId: string;
                status: import("@prisma/client").$Enums.PaymentStatus;
                updatedAt: Date;
                description: string | null;
                nominal: import("@prisma/client-runtime-utils").Decimal;
                proofImage: string;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                verifiedBy: string | null;
                verifiedAt: Date | null;
            })[];
            count: number;
            totalApproved: number;
        };
        withdrawals: {
            data: ({
                user: {
                    email: string;
                    name: string;
                    angkatan: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                userId: string;
                status: import("@prisma/client").$Enums.WithdrawalStatus;
                updatedAt: Date;
                nominal: import("@prisma/client-runtime-utils").Decimal;
                paymentMethod: import("@prisma/client").$Enums.WithdrawalPaymentMethod;
                verifiedBy: string | null;
                verifiedAt: Date | null;
                reason: string;
                savingType: import("@prisma/client").$Enums.SavingType;
                rejectionReason: string | null;
            })[];
            count: number;
            totalApproved: number;
        };
        netTotal: number;
    }>;
    getAngkatanReport(angkatan?: string): Promise<{
        angkatan: string;
        totalMembers: number;
        totalSavings: number;
        totalPayments: number;
        totalWithdrawals: number;
        members: {
            id: string;
            name: string;
            email: string;
            savings: number;
        }[];
    } | {
        angkatan: string;
        totalMembers: number;
        totalSavings: number;
        totalPayments: number;
        totalWithdrawals: number;
        members: {
            id: string;
            name: string;
            email: string;
            savings: number;
        }[];
    }[]>;
    getSummary(): Promise<{
        totalUsers: number;
        totalAnggota: number;
        pendingPayments: number;
        pendingWithdrawals: number;
        totalSavings: number | import("@prisma/client-runtime-utils").Decimal;
    }>;
}
