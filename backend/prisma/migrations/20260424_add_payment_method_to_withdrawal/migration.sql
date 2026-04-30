-- CreateEnum
CREATE TYPE "WithdrawalPaymentMethod" AS ENUM ('Cash', 'BankTransfer');

-- AlterTable
ALTER TABLE "withdrawals" ADD COLUMN "paymentMethod" "WithdrawalPaymentMethod" NOT NULL DEFAULT 'Cash';
