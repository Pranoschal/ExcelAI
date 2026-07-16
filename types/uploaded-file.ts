export interface UploadedFile {
  originalName: string;
  filename: string;
  filepath: string;
  relativePath: string;
  storagePath: string;
  bucket: string;
  size: number;
}
