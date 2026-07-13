-- Этап 4: Chat 2.0 — фото, видео, голос в сообщениях
DO $$ BEGIN
  CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'VOICE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "type" "MessageType" NOT NULL DEFAULT 'TEXT';
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "mediaPublicId" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "duration" INTEGER;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT;
ALTER TABLE "Message" ALTER COLUMN "content" SET DEFAULT '';
