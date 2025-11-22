-- CreateTable
CREATE TABLE "public"."audit_trail" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    "oldValues" JSONB,
    "newValues" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_trail_userId_idx" ON "public"."audit_trail"("userId");

-- CreateIndex
CREATE INDEX "audit_trail_tableName_idx" ON "public"."audit_trail"("tableName");

-- CreateIndex
CREATE INDEX "audit_trail_timestamp_idx" ON "public"."audit_trail"("timestamp");

-- CreateIndex
CREATE INDEX "audit_trail_action_idx" ON "public"."audit_trail"("action");

-- AddForeignKey
ALTER TABLE "public"."audit_trail" ADD CONSTRAINT "audit_trail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;