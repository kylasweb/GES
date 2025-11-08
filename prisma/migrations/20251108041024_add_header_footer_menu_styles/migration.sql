-- AlterTable
ALTER TABLE "public"."site_settings" ADD COLUMN     "footerStyle" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "headerStyle" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "menuStyle" TEXT NOT NULL DEFAULT 'default';
