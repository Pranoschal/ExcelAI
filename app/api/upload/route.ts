// app/api/upload/route.ts (or pages/api/upload.ts)
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'fileUploads');
    await mkdir(uploadsDir, { recursive: true });
    
    const uploadedFiles = [];
    
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const filepath = path.join(uploadsDir, filename);
      
      await writeFile(filepath, buffer);
      
      uploadedFiles.push({
        originalName: file.name,
        filename,
        filepath,
        size: file.size,
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}