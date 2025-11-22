/*
  Warnings:

  - You are about to drop the `audit_trail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."audit_trail" DROP CONSTRAINT "audit_trail_userId_fkey";

-- DropTable
DROP TABLE "public"."audit_trail";
