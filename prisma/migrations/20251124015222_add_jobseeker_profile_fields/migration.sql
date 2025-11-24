/*
  Warnings:

  - A unique constraint covering the columns `[shareable_link]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "country_deployed" TEXT,
ADD COLUMN     "ex_abroad" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passport_expiry" TIMESTAMP(3),
ADD COLUMN     "qr_image_path" TEXT,
ADD COLUMN     "shareable_link" TEXT,
ADD COLUMN     "vcard_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_shareable_link_key" ON "users"("shareable_link");
