import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "jpg";
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Debes enviar un archivo de imagen" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos de imagen" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "La imagen supera el máximo de 8MB" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = getExtensionFromMimeType(file.type);
    const filename = `${Date.now()}-${randomUUID()}.${ext}`;
    const fullPath = path.join(uploadsDir, filename);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(arrayBuffer));

    const publicPath = `/uploads/${filename}`;
    const absoluteUrl = new URL(publicPath, request.nextUrl.origin).toString();

    return NextResponse.json({
      url: absoluteUrl,
      path: publicPath,
      name: filename,
      mimeType: file.type,
      size: file.size,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
