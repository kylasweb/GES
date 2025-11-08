-- CreateTable
CREATE TABLE "public"."landing_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "features" TEXT[],
    "colorScheme" TEXT NOT NULL DEFAULT 'light',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Green Energy Solutions',
    "siteDescription" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "activeTemplateId" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rollout" INTEGER NOT NULL DEFAULT 100,
    "config" JSONB,
    "category" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."git_versions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "commitHash" TEXT NOT NULL,
    "commitMessage" TEXT,
    "branch" TEXT NOT NULL DEFAULT 'main',
    "author" TEXT,
    "deployedBy" TEXT,
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "changelog" TEXT[],
    "environment" TEXT NOT NULL DEFAULT 'production',
    "buildNumber" SERIAL NOT NULL,
    "rollbackable" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "git_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_templates_slug_key" ON "public"."landing_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_activeTemplateId_key" ON "public"."site_settings"("activeTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "public"."feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_category_idx" ON "public"."feature_flags"("category");

-- CreateIndex
CREATE INDEX "feature_flags_enabled_idx" ON "public"."feature_flags"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "git_versions_version_key" ON "public"."git_versions"("version");

-- CreateIndex
CREATE UNIQUE INDEX "git_versions_commitHash_key" ON "public"."git_versions"("commitHash");

-- CreateIndex
CREATE INDEX "git_versions_deployedAt_idx" ON "public"."git_versions"("deployedAt");

-- CreateIndex
CREATE INDEX "git_versions_isActive_idx" ON "public"."git_versions"("isActive");

-- CreateIndex
CREATE INDEX "git_versions_environment_idx" ON "public"."git_versions"("environment");

-- AddForeignKey
ALTER TABLE "public"."site_settings" ADD CONSTRAINT "site_settings_activeTemplateId_fkey" FOREIGN KEY ("activeTemplateId") REFERENCES "public"."landing_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
