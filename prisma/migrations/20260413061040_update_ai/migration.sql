-- AlterTable
ALTER TABLE "ticket_replies" ADD COLUMN     "is_ai" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "is_ai_active" BOOLEAN NOT NULL DEFAULT false;
