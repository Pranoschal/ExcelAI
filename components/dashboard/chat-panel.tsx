"use client";

import type { ReactNode, RefObject, FormEvent } from "react";
import type { UIMessage } from "ai";
import type { GroqModelInfo } from "@/ai/types";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextArea } from "@/components/customized-textarea";
import { ChatMessages } from "@/components/chat-messages";

interface ChatPanelProps {
  title: string;
  description: string;
  icon: ReactNode;
  messages: UIMessage[];
  status: string;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  models: GroqModelInfo[];
  modelsLoading: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  className?: string;
  contentClassName?: string;
}

export function ChatPanel({
  title,
  description,
  icon,
  messages,
  status,
  messagesEndRef,
  models,
  modelsLoading,
  selectedModel,
  setSelectedModel,
  input,
  setInput,
  isLoading,
  stop,
  onSubmit,
  ttsEnabled,
  onToggleTts,
  className,
  contentClassName,
}: ChatPanelProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            aria-pressed={ttsEnabled}
            onClick={onToggleTts}
          >
            {ttsEnabled ? (
              <VolumeX className="w-4 h-4 mr-2" />
            ) : (
              <Volume2 className="w-4 h-4 mr-2" />
            )}
            {ttsEnabled ? "Mute responses" : "Read aloud"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={contentClassName}>
        <div className="h-[28vh] sm:h-[50vh] md:h-[47vh] lg:h-[42vh] xl:h-[38vh] 2xl:h-[35vh] w-full min-w-0 mx-auto border rounded-lg p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 overflow-y-auto overflow-x-hidden break-words">
          <ChatMessages
            messages={messages}
            status={status}
            messagesEndRef={messagesEndRef}
          />
        </div>
        <form onSubmit={onSubmit} className="flex space-x-2">
          <div className="w-full">
            <TextArea
              models={models}
              modelsLoading={modelsLoading}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              setInput={setInput}
              input={input}
              isLoading={isLoading}
              status={status}
              stop={stop}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
