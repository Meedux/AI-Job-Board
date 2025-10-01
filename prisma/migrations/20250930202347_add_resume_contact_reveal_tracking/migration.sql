-- CreateTable
CREATE TABLE "resume_contact_reveals" (
    "id" TEXT NOT NULL,
    "revealed_by" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "application_id" TEXT,
    "credit_cost" INTEGER NOT NULL DEFAULT 1,
    "reveal_type" TEXT NOT NULL DEFAULT 'contact',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_contact_reveals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resume_contact_reveals_revealed_by_target_user_id_applicati_key" ON "resume_contact_reveals"("revealed_by", "target_user_id", "application_id");

-- AddForeignKey
ALTER TABLE "resume_contact_reveals" ADD CONSTRAINT "resume_contact_reveals_revealed_by_fkey" FOREIGN KEY ("revealed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_contact_reveals" ADD CONSTRAINT "resume_contact_reveals_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_contact_reveals" ADD CONSTRAINT "resume_contact_reveals_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
