import { NextRequest, NextResponse } from "next/server";
import { toApiTrainingSet } from "@/lib/api-training";
import { addTrainingSet } from "@/lib/store";

function parsePositiveNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

function parsePositiveInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number") return null;
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const routineExerciseId =
      typeof body.routineExerciseId === "string" ? body.routineExerciseId.trim() : "";
    const weightKg = parsePositiveNumber(body.weightKg);
    const durationSec = parsePositiveInteger(body.durationSec);
    const distanceMeters = parsePositiveNumber(body.distanceMeters);

    if (!userId || !routineExerciseId) {
      return NextResponse.json(
        { error: "userId y routineExerciseId son obligatorios" },
        { status: 400 }
      );
    }

    if (weightKg === null && durationSec === null && distanceMeters === null) {
      return NextResponse.json(
        { error: "Debes indicar al menos un valor de la serie" },
        { status: 400 }
      );
    }

    const trainingSet = await addTrainingSet(
      params.id,
      userId,
      routineExerciseId,
      weightKg,
      durationSec,
      distanceMeters
    );

    if (!trainingSet) {
      return NextResponse.json(
        { error: "No se pudo anadir la serie. Revisa el tipo de ejercicio y los datos." },
        { status: 400 }
      );
    }

    return NextResponse.json(toApiTrainingSet(trainingSet), { status: 201 });
  } catch (e) {
    console.error("Training set create error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}