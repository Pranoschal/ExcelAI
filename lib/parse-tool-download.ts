export interface ToolDownloadInfo {
  success?: boolean;
  downloadUrl?: string;
  fileName?: string;
  storagePath?: string;
  expiresIn?: number;
  error?: string;
  hint?: string;
}

function parseJsonText(text: string): ToolDownloadInfo | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (typeof parsed !== "object" || parsed === null) return null;

    const storagePath =
      typeof parsed.storagePath === "string" ? parsed.storagePath : undefined;
    const fileName =
      typeof parsed.fileName === "string"
        ? parsed.fileName
        : storagePath?.split("/").pop();

    return {
      success: typeof parsed.success === "boolean" ? parsed.success : undefined,
      downloadUrl:
        typeof parsed.downloadUrl === "string" ? parsed.downloadUrl : undefined,
      fileName,
      storagePath,
      expiresIn:
        typeof parsed.expiresIn === "number" ? parsed.expiresIn : undefined,
      error: typeof parsed.error === "string" ? parsed.error : undefined,
      hint: typeof parsed.hint === "string" ? parsed.hint : undefined,
    };
  } catch {
    return null;
  }
}

export function parseToolDownload(output: unknown): ToolDownloadInfo | null {
  if (output == null) return null;

  if (typeof output === "string") {
    return parseJsonText(output);
  }

  if (typeof output === "object") {
    const record = output as Record<string, unknown>;

    if (typeof record.downloadUrl === "string") {
      return parseJsonText(JSON.stringify(record));
    }

    if (Array.isArray(record.content)) {
      for (const item of record.content) {
        if (
          typeof item === "object" &&
          item !== null &&
          (item as { type?: string }).type === "text" &&
          typeof (item as { text?: string }).text === "string"
        ) {
          const parsed = parseJsonText((item as { text: string }).text);
          if (parsed) return parsed;
        }
      }
    }

    if (typeof record.text === "string") {
      return parseJsonText(record.text);
    }
  }

  return null;
}
