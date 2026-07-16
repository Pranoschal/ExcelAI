"use client";

import { Brain, Bot, User } from "lucide-react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import { MessagePartRenderer } from "@/components/message-part-renderer";

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

              {message.parts.map((part, index) => (
                <MessagePartRenderer
                  key={`${message.id}-${index}`}
                  part={part}
                  index={index}
                  partsLength={message.parts.length}
                  status={status}
                  isWideContent={isWideContent}
                />
              ))}
            </div>
          </div>
        );
      })}
      {messagesEndRef && <div ref={messagesEndRef} />}
    </>
  );
}
