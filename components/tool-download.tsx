"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  parseToolDownload,
  type ToolDownloadInfo,
} from "@/lib/parse-tool-download";

const DOWNLOAD_TOOLS = new Set([
  "write_file",
  "write_multi_sheet",
  "export_analysis",
]);

export function isDownloadTool(toolName: string): boolean {
  return DOWNLOAD_TOOLS.has(toolName);
}

interface ToolDownloadCardProps {
  output: unknown;
  toolName: string;
}

export function ToolDownloadCard({ output, toolName }: ToolDownloadCardProps) {
  const info = parseToolDownload(output);

  if (!info) return null;

  if (info.downloadUrl) {
    const label = info.fileName || "Download Excel file";
    const expiryMinutes = info.expiresIn
      ? Math.round(info.expiresIn / 60)
      : 60;

    return (
      <div className="mt-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
            <FileSpreadsheet className="h-5 w-5 text-green-700 dark:text-green-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Your file is ready
            </p>
            <p className="mt-1 text-xs text-green-800/80 dark:text-green-200/80">
              {label}
              {info.storagePath ? ` · ${info.storagePath}` : ""}
            </p>
            <p className="mt-1 text-xs text-green-700/70 dark:text-green-300/70">
              Download link expires in about {expiryMinutes} minutes.
            </p>
            <Button
              asChild
              size="sm"
              className="mt-3 bg-green-600 hover:bg-green-700 text-white"
            >
              <a
                href={info.downloadUrl}
                download={info.fileName}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Download {info.fileName || "file"}
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (info.success === false || info.error) {
    return (
      <div className="mt-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-900 dark:text-amber-100">
        <p className="font-medium">File created but download unavailable</p>
        {info.error && <p className="mt-1 text-xs">{info.error}</p>}
        {info.hint && (
          <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
            {info.hint}
          </p>
        )}
      </div>
    );
  }

  return null;
}

export function getDownloadInfo(output: unknown): ToolDownloadInfo | null {
  return parseToolDownload(output);
}
