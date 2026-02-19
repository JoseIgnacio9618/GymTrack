import { NextRequest, NextResponse } from "next/server";
import { toApiTraining } from "@/lib/api-training";
import { completeTraining, findTrainingByIdForUser } from "@/lib/store";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")?.trim() ?? "";
    if (!userId) {
      return NextResponse.json(
        { error: "El userId es obligatorio" },
        { status: 400 }
      );
    }

    const training = await findTrainingByIdForUser(params.id, userId);
    if (!training) {
      return NextResponse.json(
        { error: "Entrenamiento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(toApiTraining(training));
  } catch (e) {
    console.error("Training get error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";

    if (!userId) {
      return NextResponse.json(
        { error: "El userId es obligatorio" },
        { status: 400 }
      );
    }

    const training = await completeTraining(params.id, userId);
    if (!training) {
      return NextResponse.json(
        { error: "Entrenamiento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(toApiTraining(training));
  } catch (e) {
    console.error("Training update error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
