import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getJwtSecret } from "@/lib/jwt-secret";

const COOKIE_NAME = "session";
const EXPIRY = "30d";

export type SessionUser = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: "USER" | "ADMIN";
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: SessionUser) {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return (payload.user as SessionUser) ?? null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function registerUser(data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
}) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: data.phone },
        ...(data.email ? [{ email: data.email }] : []),
      ],
    },
  });

  if (existing) {
    throw new Error(
      existing.phone === data.phone
        ? "Этот телефон уже зарегистрирован"
        : "Этот email уже используется"
    );
  }

  const passwordHash = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      passwordHash,
    },
  });
}

export async function loginUser(phone: string, password: string) {
  const user = await prisma.user.findUnique({ where: { phone: phone.trim() } });

  if (!user?.passwordHash) {
    throw new Error("Неверный телефон или пароль");
  }
  if (user.isBlocked) throw new Error("Аккаунт заблокирован");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("Неверный телефон или пароль");

  return user;
}

export function toSessionUser(user: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: "USER" | "ADMIN";
}): SessionUser {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
  };
}
