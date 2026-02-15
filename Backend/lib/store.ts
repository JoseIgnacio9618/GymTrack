import { hash, compare } from "bcryptjs";
import { prisma } from "./prisma";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

function toRecord(user: { id: string; name: string; email: string; passwordHash: string }): UserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
  };
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<UserRecord> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new Error("EMAIL_EXISTS");

  const passwordHash = await hash(password.trim(), 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });
  return toRecord(user);
}

export async function findUserByEmailAndPassword(
  email: string,
  password: string
): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return null;
  const ok = await compare(password.trim(), user.passwordHash);
  return ok ? toRecord(user) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toRecord(user) : null;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  return user ? toRecord(user) : null;
}

export async function listUsers(email?: string): Promise<UserRecord[]> {
  const users = email
    ? await prisma.user.findMany({
        where: { email: email.trim().toLowerCase() },
      })
    : await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return users.map(toRecord);
}

/**
 * Restaura un usuario con un id dado (p. ej. desde backup del cliente).
 */
export async function restoreUser(
  id: string,
  name: string,
  email: string,
  password: string
): Promise<UserRecord | null> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing) return toRecord(existing);

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = password.trim()
    ? await hash(password.trim(), 10)
    : await hash(id + "-backup", 10);

  const user = await prisma.user.create({
    data: {
      id,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });
  return toRecord(user);
}
