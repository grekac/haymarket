import { NextRequest, NextResponse } from "next/server";
import {
  createToken,
  registerUser,
  setSessionCookie,
  toSessionUser,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, password } = await request.json();

    if (!name?.trim() || !phone?.trim() || !password) {
      return NextResponse.json(
        { error: "Заполните имя, телефон и пароль" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен быть не менее 6 символов" },
        { status: 400 }
      );
    }

    const user = await registerUser({ name, phone, email, password });
    const token = await createToken(toSessionUser(user));
    await setSessionCookie(token);

    return NextResponse.json(toSessionUser(user), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка регистрации";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
