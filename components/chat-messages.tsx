"use client";

import { Brain, Bot, User } from "lucide-react";
import Markdown from "react-markdown";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import ToolsShowcase from "@/components/tool-displayer";
import { ReasoningMessagePart } from "@/components/reasoning";
import { markdownComponents } from "@/components/markdown-components";

interface ChatMessagesProps {
  messages: UIMessage[];
  status: string;
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
}

function hasToolsShowcase(message: UIMessage): boolean {
  return message.parts.some(
    (part) =>
      isToolUIPart(part) &&
      part.state === "output-available" &&
      getToolName(part) === "showAllExcelTools"
  );
}

export function ChatMessages({
  messages,
  status,
  messagesEndRef,
}: ChatMessagesProps) {
  return (
    <>
      {messages.map((message) => {
        const isUser = message.role === "user";
        const isWideContent = !isUser && hasToolsShowcase(message);

        return (
          <div
            key={message.id}
            className={`flex items-start gap-2 sm:gap-3 mb-4 w-full min-w-0 ${
              isUser ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              {isUser ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            <div
              className={`rounded-lg p-3 min-w-0 overflow-hidden ${
                isUser
                  ? "max-w-[85%] sm:max-w-[75%]"
                  : "flex-1 w-full max-w-full"
              } ${
                isUser
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              }`}
            >
              <div className="flex items-center mb-1">
                {isUser ? (
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                ) : (
                  <Brain className="h-4 w-4 mr-2 flex-shrink-0" />
                )}
                <span className="font-semibold text-sm">
                  {isUser ? "You" : "AI Assistant"}
                </span>
              </div>

              {message.parts.map((part, index) => {
                if (part.type === "reasoning") {
                  return (
                    <ReasoningMessagePart
                      key={`${message.id}-${index}`}
                      part={part}
                      isReasoning={
                        status === "streaming" &&
                        index === message.parts.length - 1
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
                    <div
                      key={`${message.id}-${index}`}
                      className="min-w-0 w-full overflow-hidden"
                    >
                      <ToolsShowcase embedded={isWideContent} />
                    </div>
                  );
                }

                if (part.type === "text" && part.text) {
                  return (
                    <Markdown
                      key={`${message.id}-${index}`}
                      components={markdownComponents}
                    >
                      {part.text}
                    </Markdown>
                  );
                }

                return null;
              })}
            </div>
          </div>
        );
      })}
      {messagesEndRef && <div ref={messagesEndRef} />}
    </>
  );
}
