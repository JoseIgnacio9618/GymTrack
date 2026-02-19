import { NextRequest, NextResponse } from "next/server";
import { toApiTrainingStats } from "@/lib/api-training";
import { getTrainingStatsByUser } from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")?.trim() ?? "";
    if (!userId) {
      return NextResponse.json(
        { error: "El userId es obligatorio" },
        { status: 400 }
      );
    }

    const stats = await getTrainingStatsByUser(userId);
    return NextResponse.json(toApiTrainingStats(stats));
  } catch (e) {
    console.error("Training stats error:", e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
