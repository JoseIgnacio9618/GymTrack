import { NextRequest, NextResponse } from "next/server";
import { findUserById } from "@/lib/store";
import { toApiUser } from "@/lib/api-user";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await findUserById(id);
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(toApiUser(user));
  } catch (e) {
    console.error("User get error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
