-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('pending_onboarding', 'active', 'suspended');

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "clerk_org_id" TEXT NOT NULL,
ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'pending_onboarding';

-- CreateIndex
CREATE UNIQUE INDEX "tenants_clerk_org_id_key" ON "tenants"("clerk_org_id");

