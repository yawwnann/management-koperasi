-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'QRIS', 'BankTransfer');

-- AlterTable: Add column with temporary default for existing rows
ALTER TABLE "payments" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'Cash';

-- Note: The default 'Cash' will be applied to all existing 204 payment records
-- Future inserts will still require an explicit paymentMethod value in the application code
