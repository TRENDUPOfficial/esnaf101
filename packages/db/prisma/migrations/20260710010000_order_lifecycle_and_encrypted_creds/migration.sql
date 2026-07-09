-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'awaiting_invoice';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "last_error_message" TEXT,
ADD COLUMN     "paid_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tenant_integrations" DROP COLUMN "invoice_api_key",
DROP COLUMN "shipping_api_key",
ADD COLUMN     "invoice_credentials" TEXT,
ADD COLUMN     "shipping_credentials" TEXT;

