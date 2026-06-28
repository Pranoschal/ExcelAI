export interface McpHealthResult {
  ok: boolean;
  status: number | null;
  durationMs: number;
  url: string;
  error?: string;
}

export function getMcpHealthUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/health`;
}

export async function pingMcpHealth(
  baseUrl: string,
  options: { timeoutMs?: number } = {}
): Promise<McpHealthResult> {
  const timeoutMs = options.timeoutMs ?? 90_000;
  const url = getMcpHealthUrl(baseUrl);
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    return {
      ok: response.ok,
      status: response.status,
      durationMs: Date.now() - startedAt,
      url,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to reach MCP health endpoint";

    return {
      ok: false,
      status: null,
      durationMs: Date.now() - startedAt,
      url,
      error: errorMessage,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
