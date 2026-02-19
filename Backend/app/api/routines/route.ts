import { NextRequest, NextResponse } from "next/server";
import { ExerciseType } from "@prisma/client";
import { toApiRoutine } from "@/lib/api-routine";
import {
  createRoutine,
  findUserById,
  listRoutinesByUser,
  RoutineExerciseInput,
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

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")?.trim() ?? "";
    if (!userId) {
      return NextResponse.json(
        { error: "El userId es obligatorio" },
        { status: 400 }
      );
    }

    const routines = await listRoutinesByUser(userId);
    return NextResponse.json(routines.map(toApiRoutine));
  } catch (e) {
    console.error("Routines list error:", e);
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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const exercises = parseExercises(body.exercises);

    if (!userId) {
      return NextResponse.json(
        { error: "El userId es obligatorio" },
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

    const routine = await createRoutine(userId, {
      name,
      description,
      exercises,
    });

    return NextResponse.json(toApiRoutine(routine), { status: 201 });
  } catch (e) {
    console.error("Routine create error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
