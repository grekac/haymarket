-- Этап 8: Stripe-платежи за продвижение
ALTER TABLE "PromotionOrder" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "PromotionOrder_stripeSessionId_key" ON "PromotionOrder"("stripeSessionId");
CREATE INDEX IF NOT EXISTS "PromotionOrder_status_idx" ON "PromotionOrder"("status");

-- Старые demo-заказы остаются PAID; новые по умолчанию PENDING до оплаты
ALTER TABLE "PromotionOrder" ALTER COLUMN "status" SET DEFAULT 'PENDING';
