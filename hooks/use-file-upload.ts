"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import type { UploadedFile } from "@/types/uploaded-file";

const VALID_EXTENSIONS = [".xlsx", ".xls", ".csv"];

export function useFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const filteredFiles = acceptedFiles.filter((file) => {
        const ext = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();
        if (!VALID_EXTENSIONS.includes(ext)) {
          throw new Error(`Unsupported file type: ${ext}`);
        }
        return true;
      });

      if (filteredFiles.length === 0) return;

      setIsUploading(true);
      setFiles((prev) => [...prev, ...filteredFiles]);

      const formData = new FormData();
      filteredFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let result: {
        success?: boolean;
        error?: string;
        files?: UploadedFile[];
      } | null = null;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          `Upload failed with status ${response.status}. Please try again.`
        );
      }

      if (!response.ok || !result?.success || !result.files) {
        throw new Error(
          result?.error || `Upload failed with status ${response.status}`
        );
      }

      setUploadedFiles((prev) => [...prev, ...result.files!]);
      toast("Files uploaded successfully!", {
        className: "bg-green-800 border-green-700 text-white",
        duration: 3000,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("File validation error:", error);
      toast("File upload error", {
        description:
          error instanceof Error
            ? error.message
            : "Invalid file uploaded,only xlsx, xls and csv supported.",
        className: "bg-slate-800 border-slate-700 text-white",
        descriptionClassName: "text-slate-300",
        duration: 3000,
        position: "bottom-right",
      });
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
  });

  return {
    files,
    uploadedFiles,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
  };
}
