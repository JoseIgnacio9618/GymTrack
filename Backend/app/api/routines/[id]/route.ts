import { NextRequest, NextResponse } from "next/server";
import { ExerciseType } from "@prisma/client";
import { toApiRoutine } from "@/lib/api-routine";
import {
  deleteRoutine,
  findRoutineByIdForUser,
  RoutineExerciseInput,
  updateRoutine,
} from "@/lib/store";

function parseExerciseType(value: unknown): ExerciseType {
  if (
    value === ExerciseType.WEIGHT ||
    value === ExerciseType.DURATION ||
    value === ExerciseType.DISTANCE_TIME ||
    value === ExerciseType.CHRONO
  ) {
    return value;
  }
  return ExerciseType.WEIGHT;
}

function parseExercises(value: unknown): RoutineExerciseInput[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((exercise): RoutineExerciseInput | null => {
      if (typeof exercise !== "object" || exercise === null) return null;
      const input = exercise as Record<string, unknown>;
      const name = typeof input.name === "string" ? input.name.trim() : "";
      if (!name) return null;

      return {
        name,
        exerciseType: parseExerciseType(input.exerciseType),
        description: typeof input.description === "string" ? input.description.trim() : null,
        photoUrl: typeof input.photoUrl === "string" ? input.photoUrl.trim() : null,
      };
    })
    .filter((exercise): exercise is RoutineExerciseInput => exercise !== null);
}

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

    const routine = await findRoutineByIdForUser(params.id, userId);
    if (!routine) {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(toApiRoutine(routine));
  } catch (e) {
    console.error("Routine get error:", e);
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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const exercises = parseExercises(body.exercises);

    if (!userId) {
      return NextResponse.json(
        { error: "El userId es obligatorio" },
        { status: 400 }
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "El nombre de la rutina es obligatorio (mín. 2 caracteres)" },
        { status: 400 }
      );
    }

    if (exercises.length === 0) {
      return NextResponse.json(
        { error: "Debes añadir al menos un ejercicio" },
        { status: 400 }
      );
    }

    const updated = await updateRoutine(params.id, userId, {
      name,
      description,
      exercises,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(toApiRoutine(updated));
  } catch (e) {
    console.error("Routine update error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const deleted = await deleteRoutine(params.id, userId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Routine delete error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
