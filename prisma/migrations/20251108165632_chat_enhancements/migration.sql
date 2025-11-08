-- AlterTable
ALTER TABLE "public"."chat_messages" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."chats" ADD COLUMN     "department" TEXT DEFAULT 'general',
ADD COLUMN     "emailNotificationSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firstResponseAt" TIMESTAMP(3),
ADD COLUMN     "isOfflineMessage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offlineNotificationSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "ratingComment" TEXT,
ADD COLUMN     "resolutionTime" INTEGER,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "responseTime" INTEGER;

-- CreateTable
CREATE TABLE "public"."chat_analytics" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "visitorMessages" INTEGER NOT NULL DEFAULT 0,
    "adminMessages" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER,
    "longestResponseTime" INTEGER,
    "shortestResponseTime" INTEGER,
    "sessionDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_presence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "socketId" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_presence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_analytics_chatId_key" ON "public"."chat_analytics"("chatId");

-- CreateIndex
CREATE INDEX "chat_analytics_chatId_idx" ON "public"."chat_analytics"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_departments_name_key" ON "public"."chat_departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "chat_departments_slug_key" ON "public"."chat_departments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "admin_presence_userId_key" ON "public"."admin_presence"("userId");

-- CreateIndex
CREATE INDEX "admin_presence_isOnline_idx" ON "public"."admin_presence"("isOnline");

-- CreateIndex
CREATE INDEX "admin_presence_department_idx" ON "public"."admin_presence"("department");

-- CreateIndex
CREATE INDEX "chats_department_idx" ON "public"."chats"("department");

-- CreateIndex
CREATE INDEX "chats_isOfflineMessage_idx" ON "public"."chats"("isOfflineMessage");

-- AddForeignKey
ALTER TABLE "public"."chat_analytics" ADD CONSTRAINT "chat_analytics_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
