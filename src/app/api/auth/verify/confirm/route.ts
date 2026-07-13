import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const { code } = await request.json();
  if (!code || String(code).length !== 6) {
    return NextResponse.json({ error: "Введите 6-значный код" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

  const record = await prisma.phoneVerification.findUnique({ where: { phone: user.phone } });
  if (!record) return NextResponse.json({ error: "Сначала запросите код" }, { status: 400 });
  if (record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Код истёк — запросите новый" }, { status: 400 });
  }
  if (record.attempts >= 5) {
    return NextResponse.json({ error: "Слишком много попыток" }, { status: 429 });
  }

  const valid = await bcrypt.compare(String(code), record.codeHash);
  if (!valid) {
    await prisma.phoneVerification.update({
      where: { phone: user.phone },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json({ error: "Неверный код" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifiedAt: new Date() },
    }),
    prisma.phoneVerification.delete({ where: { phone: user.phone } }),
  ]);

  return NextResponse.json({ ok: true, verified: true });
}
