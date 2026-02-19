import { NextRequest, NextResponse } from "next/server";
import { toApiTraining } from "@/lib/api-training";
import {
  createTraining,
  findActiveTrainingByUser,
  findUserById,
  listTrainingsByUser,
} from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")?.trim() ?? "";
    const activeOnly = request.nextUrl.searchParams.get("active") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "El userId es obligatorio" },
        { status: 400 }
      );
    }

    if (activeOnly) {
      const activeTraining = await findActiveTrainingByUser(userId);
      return NextResponse.json(activeTraining ? toApiTraining(activeTraining) : null);
    }

    const trainings = await listTrainingsByUser(userId);
    return NextResponse.json(trainings.map(toApiTraining));
  } catch (e) {
    console.error("Trainings list error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const routineId = typeof body.routineId === "string" ? body.routineId.trim() : "";

    if (!userId || !routineId) {
      return NextResponse.json(
        { error: "userId y routineId son obligatorios" },
        { status: 400 }
      );
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const activeTraining = await findActiveTrainingByUser(userId);
    if (activeTraining) {
      return NextResponse.json(
        { error: "Ya tienes un entrenamiento activo. Finalízalo antes de iniciar otro." },
        { status: 409 }
      );
    }

    const training = await createTraining(userId, routineId);
    if (!training) {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(toApiTraining(training), { status: 201 });
  } catch (e) {
    console.error("Training create error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
