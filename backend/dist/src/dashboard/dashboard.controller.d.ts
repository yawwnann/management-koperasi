import { DashboardService } from './dashboard.service';
interface JwtRequest extends Request {
    user: {
        sub: string;
        role: string;
        email: string;
        name: string;
    };
}
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(req: JwtRequest): Promise<{
        success: boolean;
        data: {
            totalMembers: number;
            totalSavings: number;
            pendingPayments: number;
            pendingWithdrawals: number;
            approvedPayments: number;
            rejectedPayments: number;
            totalPayments: number;
            totalWithdrawals: number;
            recentActivities: {
                id: any;
                type: string;
                userName: any;
                amount: number;
                status: any;
                createdAt: any;
            }[];
            recentApprovals: {
                id: any;
                type: string;
                userName: any;
                amount: number;
                status: any;
                approvedAt: any;
            }[];
            recentAlerts: any[];
            paymentTrend: {
                labels: string[];
                payments: any[];
                withdrawals: any[];
            };
            paymentStatus: {
                approved: number;
                pending: number;
                rejected: number;
            };
            savingsBreakdown: {
                pokok: number;
                wajib: number;
                sukarela: number;
            };
            memberActivity: {
                angkatan: string[];
                members: number[];
                savings: number[];
            };
        } | {
            user: {
                name: string | undefined;
                email: string | undefined;
                angkatan: string | null | undefined;
                memberSince: Date | undefined;
            };
            totalBalance: number;
            pendingPayments: number;
            approvedPayments: number;
            rejectedPayments: number;
            pendingWithdrawals: number;
            approvedWithdrawals: number;
            recentActivities: {
                id: any;
                type: string;
                amount: number;
                status: any;
                createdAt: any;
                description: any;
            }[];
            savingsBreakdown: {
                pokok: number;
                wajib: number;
                sukarela: number;
            };
            paymentTrend: {
                labels: string[];
                payments: any[];
                withdrawals: any[];
            };
            pemutihanAlert: {
                status: boolean;
                monthsUnpaid: number;
            };
        };
    }>;
}
export {};
