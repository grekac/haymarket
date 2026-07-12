import { NextRequest, NextResponse } from "next/server";
import {
  createToken,
  loginUser,
  setSessionCookie,
  toSessionUser,
} from "@/lib/auth";
import { databaseUrlHint, isDirectSupabaseHost } from "@/lib/database-url";

export async function POST(request: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL ?? "";
    if (isDirectSupabaseHost(dbUrl)) {
      return NextResponse.json(
        {
          error:
            "Сайт не подключён к базе. На Render замените DATABASE_URL на Session pooler из Supabase (не db.*.supabase.co).",
          hint: databaseUrlHint(),
        },
        { status: 503 }
      );
    }

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
    if (message.includes("Can't reach database server")) {
      return NextResponse.json(
        {
          error: "Нет связи с базой. Замените DATABASE_URL на Session pooler в Render → Environment.",
          hint: databaseUrlHint(),
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: message }, { status: 401 });
  }}
