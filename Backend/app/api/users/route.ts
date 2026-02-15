import { NextRequest, NextResponse } from "next/server";
import { listUsers, createUser, restoreUser, findUserById } from "@/lib/store";
import { toApiUser } from "@/lib/api-user";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email") ?? undefined;
    const users = await listUsers(email);
    const apiUsers = users.map((u) => toApiUser(u));
    return NextResponse.json(apiUsers);
  } catch (e) {
    console.error("Users list error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : null;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email requeridos" },
        { status: 400 }
      );
    }

    if (id) {
      const existing = await findUserById(id);
      if (existing) {
        return NextResponse.json(toApiUser(existing));
      }
      const restored = await restoreUser(id, name, email, password);
      return NextResponse.json(toApiUser(restored!));
    }

    const pwd = password || "backup-no-password";
    const user = await createUser(name, email, pwd);
    return NextResponse.json(toApiUser(user));
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "EMAIL_EXISTS") {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }
    const prismaError = e as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }
    console.error("Users create error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
