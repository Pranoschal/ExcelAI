import {
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
  tool,
  type ModelMessage,
} from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { resolveChatModel } from "@/ai/groq-models";
import { getLanguageModel } from "@/ai/providers";
import { pingMcpHealthWithCache } from "@/lib/mcp-health";
import { getCachedMcpToolDefinitions } from "@/lib/mcp-tool-cache";

function hasMessageContent(message: ModelMessage): boolean {
  if (typeof message.content === "string") {
    return message.content.length > 0;
  }
  return Array.isArray(message.content) && message.content.length > 0;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, selectedModel, uploadedFiles } = await req.json();
    const modelMessages = (await convertToModelMessages(messages)).filter(
      hasMessageContent
    );

    const render_dot_com_url = process.env.RENDER_MCP_URL;

    if (!render_dot_com_url) {
      throw new Error("RENDER_MCP_URL environment variable is not set");
    }

    const warmup = await pingMcpHealthWithCache(render_dot_com_url, {
      timeoutMs: 90_000,
    });
    if (!warmup.ok) {
      console.warn("MCP warmup ping failed before chat:", warmup);
    }

    let mcpClient;
    try {
      mcpClient = await createMCPClient({
        transport: {
          type: "http",
          url: `${render_dot_com_url}/mcp`,
        },
      });
    } catch (mcpError: unknown) {
      console.error("MCP Client Error:", mcpError);
      const errorMessage =
        mcpError instanceof Error ? mcpError.message : String(mcpError);
      throw new Error(`Failed to connect to MCP server: ${errorMessage}`);
    }

    let mcptools;
    try {
      const toolDefinitions = await getCachedMcpToolDefinitions(mcpClient);
      mcptools = mcpClient.toolsFromDefinitions(toolDefinitions);
    } catch (toolsError: unknown) {
      console.error("MCP Tools Error:", toolsError);
      const errorMessage =
        toolsError instanceof Error ? toolsError.message : String(toolsError);
      throw new Error(`Failed to get MCP tools: ${errorMessage}`);
    }

    const tools = {
      showAllExcelTools: tool({
        description:
          "When the user asks to display all the tools available for working with excel,or the user says tools or tools please etc",
        inputSchema: z.object({}),
        execute: async () => {
          return "";
        },
      }),
      ...mcptools,
    };

    let systemMessage = `You are ExcelAI Pro, an intelligent assistant built into a web application. You specialize in working with Excel spreadsheets. Your purpose is to help users:

      - Create Excel sheets with structured data
      - Modify existing Excel sheets (add, remove, update content)
      - Analyze spreadsheet data and generate summaries, charts, or insights

      You are integrated with a language model through the Vercel AI SDK and can interact with structured data using natural language.

      If the user asks for anything outside of spreadsheet-related tasks (e.g., coding, general knowledge, entertainment, personal advice, etc.), politely but firmly decline and redirect them to ask something related to Excel or spreadsheet management.

      Always be clear, professional, and focused on spreadsheet-related functionality.

      Example behaviors:
      -  "Create a budget tracker in Excel" → Proceed
      -  "Analyze this sales data and show me trends" → Proceed
      -  "Tell me a joke" → Decline
      -  "Write a story" → Decline

      Never break character or act outside your role. Remain focused and helpful within the Excel domain.

      When you create or export a file with write_file, write_multi_sheet, or export_analysis:
      - The file is uploaded to Supabase and the tool result includes downloadUrl, fileName, and storagePath.
      - Tell the user their file is ready and they can click the Download button shown in the chat.
      - Never tell users to open server filesystem paths like /opt/render/... or use SCP/SFTP.
      - If upload fails, explain that Supabase may not be configured on the MCP server.`;

    if (uploadedFiles && uploadedFiles.length > 0) {
      const fileList = uploadedFiles
        .map(
          (f: {
            originalName: string;
            filepath?: string;
            relativePath?: string;
            filename?: string;
            storagePath?: string;
          }) => {
            const toolPath =
              f.storagePath || f.relativePath || f.filename || f.filepath;
            return `"${f.originalName}" (path: ${toolPath})`;
          }
        )
        .join(", ");
      console.log("FILE LIST", fileList);
      systemMessage += `\n\nAvailable uploaded files: ${fileList}

These paths are storage object keys in Supabase. When calling Excel/CSV tools, pass the path value exactly as given (for example: 1784...-sales.csv). Do not invent local disk paths.`;
    } else {
      systemMessage += `\n\nNo files are currently uploaded. You can still create new Excel/CSV files using the write_file (or write_multi_sheet) tool when the user asks to generate or create a new sheet. Prefer creating the file rather than asking them to upload first. Only ask for an upload when they want to analyze or modify an existing file. After creation, direct the user to the Download button in chat.`;
    }

    const { modelId, reasoning } = await resolveChatModel(selectedModel);

    const result = streamText({
      model: getLanguageModel(modelId),
      ...(reasoning && {
        providerOptions: {
          groq: { reasoningFormat: "parsed" },
        },
      }),
      system: systemMessage,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(5),
      experimental_transform: smoothStream({
        chunking: "word",
      }),
      onFinish: async () => {
        await mcpClient.close().catch(() => undefined);
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      onError: (error) => {
        const message = error instanceof Error ? error.message : String(error);
        if (
          message.toLowerCase().includes("model") &&
          message.toLowerCase().includes("decommissioned")
        ) {
          return "The selected AI model is no longer available. Please choose a different model from the dropdown.";
        }
        return message || "Failed to generate a response. Please try another model.";
      },
    });
  } catch (error: unknown) {
    console.error("API Route Error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return new NextResponse(
      JSON.stringify({
        errorMessage: errorMessage || "Internal server error",
        type: "api_error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
