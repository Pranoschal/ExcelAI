import { verifyCronSecret } from "@/lib/cron-auth";
import { pingMcpHealth } from "@/lib/mcp-health";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mcpBaseUrl = process.env.RENDER_MCP_URL;
  if (!mcpBaseUrl) {
    return NextResponse.json(
      { error: "RENDER_MCP_URL environment variable is not set" },
      { status: 500 }
    );
  }

  const result = await pingMcpHealth(mcpBaseUrl, { timeoutMs: 110_000 });

  if (!result.ok) {
    console.error("MCP keep-warm ping failed:", result);
    return NextResponse.json(
      {
        ok: false,
        ...result,
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }

  console.log(
    `MCP keep-warm ping succeeded in ${result.durationMs}ms (${result.url})`
  );

  return NextResponse.json({
    ok: true,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
