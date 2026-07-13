import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  if (user.isVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.phoneVerification.upsert({
    where: { phone: user.phone },
    create: { phone: user.phone, codeHash, expiresAt },
    update: { codeHash, expiresAt, attempts: 0 },
  });

  const sms = await sendSms(user.phone, `HayMarket код: ${code}`);
  return NextResponse.json({
    ok: true,
    message: sms.sent ? "Код отправлен по SMS" : "Код сгенерирован (SMS не настроен)",
    ...(process.env.NODE_ENV === "development" && !sms.sent ? { devCode: code } : {}),
  });
}
