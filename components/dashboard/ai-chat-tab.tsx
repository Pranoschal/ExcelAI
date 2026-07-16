"use client";

import type { FormEvent, RefObject } from "react";
import type { UIMessage } from "ai";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import type { GroqModelInfo } from "@/ai/types";
import { ChatPanel } from "@/components/dashboard/chat-panel";

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 },
};

interface AiChatTabProps {
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
}

export function AiChatTab({
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
}: AiChatTabProps) {
  return (
    <motion.div variants={slideIn} initial="initial" animate="animate">
      <ChatPanel
        className="min-w-0"
        contentClassName="min-w-0 space-y-2"
        title="AI Assistant"
        description="Chat with AI about your Excel needs"
        icon={<MessageSquare className="w-5 h-5" />}
        messages={messages}
        status={status}
        messagesEndRef={messagesEndRef}
        models={models}
        modelsLoading={modelsLoading}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        stop={stop}
        onSubmit={onSubmit}
        ttsEnabled={ttsEnabled}
        onToggleTts={onToggleTts}
      />
    </motion.div>
  );
}
