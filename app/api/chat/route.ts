// In your route.ts
import { convertToCoreMessages, smoothStream, streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { experimental_createMCPClient as createMCPClient } from "ai";
import z from "zod";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { model, modelID } from "@/ai/providers";
import { reasoningModelNames } from "@/ai/providers";
// In your route.ts
export async function POST(req: NextRequest) {
  try {
    const { messages, selectedModel, files,uploadedFiles } = await req.json();
    console.log('Uploaded',uploadedFiles)
    const coreMessages = convertToCoreMessages(messages).filter(
      (message) => message.content.length > 0
    );

    const render_dot_com_url = process.env.RENDER_MCP_URL;

    if (!render_dot_com_url) {
      throw new Error("RENDER_MCP_URL environment variable is not set");
    }

    // const url = new URL(`${render_dot_com_url}/mcp`);
    const url = new URL(` http://localhost:5050/mcp`)

    let mcpClient;
    try {
      mcpClient = await createMCPClient({
        transport: new StreamableHTTPClientTransport(url),
      });
    } catch (mcpError: unknown) {
      console.error("MCP Client Error:", mcpError);
      const errorMessage =
        mcpError instanceof Error ? mcpError.message : String(mcpError);
      throw new Error(`Failed to connect to MCP server: ${errorMessage}`);
    }

    let mcptools;
    try {
      mcptools = await mcpClient.tools();
    } catch (toolsError: unknown) {
      console.error("MCP Tools Error:", toolsError);
      const errorMessage =
        toolsError instanceof Error ? toolsError.message : String(toolsError);
      throw new Error(`Failed to get MCP tools: ${errorMessage}`);
    }

    const tools = {
      showAllExcelTools: {
        description:
          "When the user asks to display all the tools available for working with excel,or the user says tools or tools please etc",
        parameters: z.object({}),
        execute: async () => {
          return "";
        },
      },
      ...mcptools,
    };
    // Build system message based on uploaded files
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

      Never break character or act outside your role. Remain focused and helpful within the Excel domain.`;

    if (uploadedFiles && uploadedFiles.length > 0) {
      const fileList = uploadedFiles.map((f: any) => 
        `"${f.originalName}" (path: ${f.filepath})`
      ).join(', ');
      
      systemMessage += `\n\nAvailable uploaded files: ${fileList}
      
When users ask to read, analyze, or work with these files, use the appropriate tools with the exact filepath provided above.`;
    } else {
      systemMessage += `\n\nNo files are currently uploaded. Ask the user to upload Excel files (.xlsx, .xls, .csv) to get started with file analysis.`;
    }
    

    const result = await streamText({
      model: model.languageModel(selectedModel),
      ...(selectedModel in reasoningModelNames && {
        providerOptions: {
          groq: { reasoningFormat: "raw" },
        },
      }),
      system: systemMessage,
      messages: coreMessages,
      tools: tools,
      experimental_transform: [
        smoothStream({
          chunking: "word",
        }),
      ],
    });

    return result.toDataStreamResponse({
      sendReasoning: true,
    });
  } catch (error: unknown) {
    console.error("API Route Error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Return a proper error response that the AI SDK can parse
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
