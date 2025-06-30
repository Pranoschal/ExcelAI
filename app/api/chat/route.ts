import { convertToCoreMessages, streamText } from "ai";
import { NextRequest } from "next/server";
import { groq } from "@ai-sdk/groq";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { Experimental_StdioMCPTransport as StdioMCPTransport } from "ai/mcp-stdio";
import z from "zod";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0
  );

  const mcpClient = await createMCPClient({
    transport: new StdioMCPTransport({
      command: "node",
      args: ["mcp-server/excel-mcp/dist/index.js"],
    }),
  });

  const mcptools = await mcpClient.tools();
  const tools = {showAllExcelTools : {

  description: 'Displays all the tools available for working with excel',
  parameters: z.object({}),
  execute: async () => {
    return ''
},
  ...mcptools
}}
  const result = await streamText({
    model: groq("qwen-qwq-32b"),
    providerOptions: {
      groq: { reasoningFormat: "parsed" },
    },
    system: `You are ExcelAI Pro, an intelligent assistant built into a web application. You specialize in working with Excel spreadsheets. Your purpose is to help users:

        - Create Excel sheets with structured data
        - Modify existing Excel sheets (add, remove, update content)
        - Analyze spreadsheet data and generate summaries, charts, or insights

        You are integrated with a language model through the Vercel AI SDK and can interact with structured data using natural language.

        🚫 If the user asks for anything outside of spreadsheet-related tasks (e.g., coding, general knowledge, entertainment, personal advice, etc.), politely but firmly decline and redirect them to ask something related to Excel or spreadsheet management.

        ✅ Always be clear, professional, and focused on spreadsheet-related functionality.

        Example behaviors:
        - ✅ "Create a budget tracker in Excel" → Proceed
        - ✅ "Analyze this sales data and show me trends" → Proceed
        - 🚫 "Tell me a joke" → Decline
        - 🚫 "Write a story" → Decline

        Never break character or act outside your role. Remain focused and helpful within the Excel domain.`,
    messages: coreMessages,
    tools:tools
  });

  return result.toDataStreamResponse();
}
