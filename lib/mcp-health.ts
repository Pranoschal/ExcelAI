import { redis } from "@/lib/redis";

const MCP_WARM_CACHE_KEY = "excelai:mcp-warm:v1";
const MCP_WARM_CACHE_TTL_SECONDS = 300;

export interface McpHealthResult {
  ok: boolean;
  status: number | null;
  durationMs: number;
  url: string;
  error?: string;
  cached?: boolean;
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

export async function pingMcpHealthWithCache(
  baseUrl: string,
  options: { timeoutMs?: number } = {}
): Promise<McpHealthResult> {
  const url = getMcpHealthUrl(baseUrl);

  if (redis) {
    try {
      const recentlyWarm = await redis.get<boolean>(MCP_WARM_CACHE_KEY);
      if (recentlyWarm === true) {
        return {
          ok: true,
          status: null,
          durationMs: 0,
          url,
          cached: true,
        };
      }
    } catch (error) {
      console.warn("Failed to read MCP warm state from Redis:", error);
    }
  }

  const result = await pingMcpHealth(baseUrl, options);

  if (result.ok && redis) {
    try {
      await redis.set(MCP_WARM_CACHE_KEY, true, {
        ex: MCP_WARM_CACHE_TTL_SECONDS,
      });
    } catch (error) {
      console.warn("Failed to cache MCP warm state in Redis:", error);
    }
  }

  return result;
}
