import { NextRequest, NextResponse } from "next/server";
import {
  createToken,
  loginUser,
  setSessionCookie,
  toSessionUser,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone?.trim() || !password) {
      return NextResponse.json(
        { error: "Введите телефон и пароль" },
        { status: 400 }
      );
    }

    const user = await loginUser(phone, password);
    const token = await createToken(toSessionUser(user));
    await setSessionCookie(token);

    return NextResponse.json(toSessionUser(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка входа";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
