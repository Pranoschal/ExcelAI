"use client";

import Markdown from "react-markdown";
import {
  getToolName,
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
  type UIMessage,
} from "ai";
import ToolsShowcase from "@/components/tool-displayer";
import { ReasoningMessagePart } from "@/components/reasoning";
import { markdownComponents } from "@/components/markdown-components";
import { isDownloadTool, ToolDownloadCard } from "@/components/tool-download";

interface MessagePartRendererProps {
  part: UIMessage["parts"][number];
  index: number;
  partsLength: number;
  status: string;
  isWideContent: boolean;
}

export function MessagePartRenderer({
  part,
  index,
  partsLength,
  status,
  isWideContent,
}: MessagePartRendererProps) {
  if (isReasoningUIPart(part)) {
    return (
      <ReasoningMessagePart
        part={part}
        isReasoning={
          status === "streaming" && index === partsLength - 1
        }
      />
    );
  }

  if (
    isToolUIPart(part) &&
    part.state === "output-available" &&
    getToolName(part) === "showAllExcelTools"
  ) {
    return (
      <div className="min-w-0 w-full overflow-hidden">
        <ToolsShowcase embedded={isWideContent} />
      </div>
    );
  }

  if (
    isToolUIPart(part) &&
    part.state === "output-available" &&
    isDownloadTool(getToolName(part))
  ) {
    return (
      <ToolDownloadCard
        output={part.output}
        toolName={getToolName(part)}
      />
    );
  }

  if (isTextUIPart(part) && part.text) {
    return (
      <Markdown components={markdownComponents}>{part.text}</Markdown>
    );
  }

  return null;
}
