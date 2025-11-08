-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER');

-- CreateTable
CREATE TABLE "public"."media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "alt" TEXT,
    "caption" TEXT,
    "type" "public"."MediaType" NOT NULL DEFAULT 'IMAGE',
    "folder" TEXT,
    "tags" TEXT[],
    "uploadedBy" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_type_idx" ON "public"."media"("type");

-- CreateIndex
CREATE INDEX "media_folder_idx" ON "public"."media"("folder");

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "public"."media"("createdAt");
