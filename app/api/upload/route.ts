import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseBucket } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeFilename(name: string) {
  return name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_").trim() || "upload.bin";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      return NextResponse.json(
        {
          error:
            "No files received. Please choose an .xlsx, .xls, or .csv file.",
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const bucket = getSupabaseBucket();
    const uploadedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const safeName = sanitizeFilename(file.name);
      // Storage object key used by MCP tools as filePath
      const storagePath = `${timestamp}-${safeName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      uploadedFiles.push({
        originalName: file.name,
        filename: storagePath,
        // MCP resolves this via Supabase download
        filepath: storagePath,
        relativePath: storagePath,
        storagePath,
        bucket,
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload files";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
