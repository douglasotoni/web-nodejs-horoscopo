-- Drop existing types if they exist (for migration reset)
DROP TYPE IF EXISTS "Sign" CASCADE;
DROP TYPE IF EXISTS "Weekday" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "PredictionStatus" CASCADE;

-- CreateEnum
CREATE TYPE "Sign" AS ENUM ('aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "PredictionStatus" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'viewer',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_predictions" (
    "id" SERIAL NOT NULL,
    "careerAdviceId" INTEGER,
    "loveAdviceId" INTEGER,
    "crystalId" INTEGER,
    "dailyAlertId" INTEGER,
    "recommendedActivityId" INTEGER,
    "practicalAdviceId" INTEGER,
    "luckyColorId" INTEGER,
    "emotionId" INTEGER,
    "impactPhraseId" INTEGER,
    "mantraId" INTEGER,
    "sign" "Sign" NOT NULL,
    "weekday" "Weekday" NOT NULL,
    "iso_week" INTEGER NOT NULL,
    "iso_year" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "lucky_number" INTEGER NOT NULL,
    "element" TEXT,
    "quality" TEXT,
    "rulingPlanet" TEXT,
    "lucky_color" TEXT,
    "emotion" TEXT,
    "practical_advice" TEXT,
    "compatible_signs" TEXT,
    "numerology_meaning" TEXT,
    "impact_phrase" TEXT,
    "recommended_activities" TEXT,
    "daily_alert" TEXT,
    "energy_level" INTEGER,
    "crystal" TEXT,
    "mantra" TEXT,
    "love_advice" TEXT,
    "career_advice" TEXT,
    "status" "PredictionStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_predictions" (
    "id" SERIAL NOT NULL,
    "sign" "Sign" NOT NULL,
    "iso_week" INTEGER NOT NULL,
    "iso_year" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "lucky_number" INTEGER NOT NULL,
    "status" "PredictionStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" INTEGER,
    "metadata" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zodiac_signs" (
    "id" SERIAL NOT NULL,
    "name" "Sign" NOT NULL,
    "display_name" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "ruling_planet" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zodiac_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_advices" (
    "id" SERIAL NOT NULL,
    "sign_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_advices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "love_advices" (
    "id" SERIAL NOT NULL,
    "sign_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "love_advices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crystals" (
    "id" SERIAL NOT NULL,
    "sign_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crystals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_alerts" (
    "id" SERIAL NOT NULL,
    "sign_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommended_activities" (
    "id" SERIAL NOT NULL,
    "sign_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommended_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practical_advices" (
    "id" SERIAL NOT NULL,
    "sign_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practical_advices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lucky_colors" (
    "id" SERIAL NOT NULL,
    "sign_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lucky_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotions" (
    "id" SERIAL NOT NULL,
    "sign_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impact_phrases" (
    "id" SERIAL NOT NULL,
    "sign_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "impact_phrases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mantras" (
    "id" SERIAL NOT NULL,
    "sign_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mantras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "daily_predictions_sign_weekday_iso_week_iso_year_idx" ON "daily_predictions"("sign", "weekday", "iso_week", "iso_year");

-- CreateIndex
CREATE UNIQUE INDEX "daily_predictions_sign_weekday_iso_week_iso_year_key" ON "daily_predictions"("sign", "weekday", "iso_week", "iso_year");

-- CreateIndex
CREATE INDEX "weekly_predictions_sign_iso_week_iso_year_idx" ON "weekly_predictions"("sign", "iso_week", "iso_year");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_predictions_sign_iso_week_iso_year_key" ON "weekly_predictions"("sign", "iso_week", "iso_year");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "zodiac_signs_name_key" ON "zodiac_signs"("name");

-- CreateIndex
CREATE INDEX "career_advices_sign_id_is_active_idx" ON "career_advices"("sign_id", "is_active");

-- CreateIndex
CREATE INDEX "love_advices_sign_id_is_active_idx" ON "love_advices"("sign_id", "is_active");

-- CreateIndex
CREATE INDEX "crystals_sign_id_is_active_idx" ON "crystals"("sign_id", "is_active");

-- CreateIndex
CREATE INDEX "daily_alerts_sign_id_is_active_idx" ON "daily_alerts"("sign_id", "is_active");

-- CreateIndex
CREATE INDEX "recommended_activities_sign_id_is_active_idx" ON "recommended_activities"("sign_id", "is_active");

-- CreateIndex
CREATE INDEX "practical_advices_sign_id_is_active_idx" ON "practical_advices"("sign_id", "is_active");

-- CreateIndex
CREATE INDEX "lucky_colors_sign_id_is_active_idx" ON "lucky_colors"("sign_id", "is_active");

-- CreateIndex
CREATE INDEX "emotions_sign_id_is_active_idx" ON "emotions"("sign_id", "is_active");

-- CreateIndex
CREATE INDEX "impact_phrases_sign_id_is_active_idx" ON "impact_phrases"("sign_id", "is_active");

-- CreateIndex
CREATE INDEX "mantras_sign_id_is_active_idx" ON "mantras"("sign_id", "is_active");

-- AddForeignKey
ALTER TABLE "daily_predictions" ADD CONSTRAINT "daily_predictions_careerAdviceId_fkey" FOREIGN KEY ("careerAdviceId") REFERENCES "career_advices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_predictions" ADD CONSTRAINT "daily_predictions_loveAdviceId_fkey" FOREIGN KEY ("loveAdviceId") REFERENCES "love_advices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_predictions" ADD CONSTRAINT "daily_predictions_crystalId_fkey" FOREIGN KEY ("crystalId") REFERENCES "crystals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_predictions" ADD CONSTRAINT "daily_predictions_dailyAlertId_fkey" FOREIGN KEY ("dailyAlertId") REFERENCES "daily_alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_predictions" ADD CONSTRAINT "daily_predictions_recommendedActivityId_fkey" FOREIGN KEY ("recommendedActivityId") REFERENCES "recommended_activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_predictions" ADD CONSTRAINT "daily_predictions_practicalAdviceId_fkey" FOREIGN KEY ("practicalAdviceId") REFERENCES "practical_advices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_predictions" ADD CONSTRAINT "daily_predictions_luckyColorId_fkey" FOREIGN KEY ("luckyColorId") REFERENCES "lucky_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_predictions" ADD CONSTRAINT "daily_predictions_emotionId_fkey" FOREIGN KEY ("emotionId") REFERENCES "emotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_predictions" ADD CONSTRAINT "daily_predictions_impactPhraseId_fkey" FOREIGN KEY ("impactPhraseId") REFERENCES "impact_phrases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_predictions" ADD CONSTRAINT "daily_predictions_mantraId_fkey" FOREIGN KEY ("mantraId") REFERENCES "mantras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_advices" ADD CONSTRAINT "career_advices_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "zodiac_signs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "love_advices" ADD CONSTRAINT "love_advices_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "zodiac_signs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crystals" ADD CONSTRAINT "crystals_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "zodiac_signs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_alerts" ADD CONSTRAINT "daily_alerts_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "zodiac_signs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommended_activities" ADD CONSTRAINT "recommended_activities_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "zodiac_signs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practical_advices" ADD CONSTRAINT "practical_advices_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "zodiac_signs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lucky_colors" ADD CONSTRAINT "lucky_colors_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "zodiac_signs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emotions" ADD CONSTRAINT "emotions_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "zodiac_signs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impact_phrases" ADD CONSTRAINT "impact_phrases_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "zodiac_signs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantras" ADD CONSTRAINT "mantras_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "zodiac_signs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
