import type { ListToolsResult, MCPClient } from "@ai-sdk/mcp";
import { Redis } from "@upstash/redis";

const MCP_TOOLS_CACHE_KEY = "excelai:mcp-tools:v1";
const MCP_TOOLS_CACHE_TTL_SECONDS = 60 * 60;

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

function isListToolsResult(value: unknown): value is ListToolsResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "tools" in value &&
    Array.isArray(value.tools)
  );
}

export async function getCachedMcpToolDefinitions(
  mcpClient: MCPClient
): Promise<ListToolsResult> {
  if (redis) {
    try {
      const cachedDefinitions = await redis.get<unknown>(MCP_TOOLS_CACHE_KEY);

      if (isListToolsResult(cachedDefinitions)) {
        return cachedDefinitions;
      }
    } catch (error) {
      console.warn("Failed to read MCP tools from Redis; using MCP directly:", error);
    }
  }

  const definitions = await mcpClient.listTools();

  if (redis) {
    try {
      await redis.set(MCP_TOOLS_CACHE_KEY, definitions, {
        ex: MCP_TOOLS_CACHE_TTL_SECONDS,
      });
    } catch (error) {
      console.warn("Failed to cache MCP tools in Redis:", error);
    }
  } else {
    console.warn(
      "Redis credentials are not configured; MCP tool definitions will not be cached."
    );
  }

  return definitions;
}
