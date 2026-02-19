import { NextRequest, NextResponse } from "next/server";
import { toApiExerciseProgressStats } from "@/lib/api-training";
import { getExerciseProgressStatsForRoutine } from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")?.trim() ?? "";
    const routineId = request.nextUrl.searchParams.get("routineId")?.trim() ?? "";

    if (!userId || !routineId) {
      return NextResponse.json(
        { error: "userId y routineId son obligatorios" },
        { status: 400 }
      );
    }

    const stats = await getExerciseProgressStatsForRoutine(userId, routineId);
    if (!stats) {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(stats.map(toApiExerciseProgressStats));
  } catch (e) {
    console.error("Exercise stats error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
