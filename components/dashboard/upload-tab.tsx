"use client";

import type { FormEvent, RefObject } from "react";
import type { UIMessage } from "ai";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import type { GroqModelInfo } from "@/ai/types";
import type { UploadedFile } from "@/types/uploaded-file";
import { ChatPanel } from "@/components/dashboard/chat-panel";
import { FileUploadZone } from "@/components/dashboard/file-upload-zone";

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 },
};

interface UploadTabProps {
  files: File[];
  uploadedFiles: UploadedFile[];
  isUploading: boolean;
  isDragActive: boolean;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
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

export function UploadTab({
  files,
  uploadedFiles,
  isUploading,
  isDragActive,
  getRootProps,
  getInputProps,
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
}: UploadTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
      <FileUploadZone
        files={files}
        uploadedFiles={uploadedFiles}
        isUploading={isUploading}
        isDragActive={isDragActive}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
      />

      <motion.div
        variants={slideIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <ChatPanel
          className="h-full min-w-0"
          contentClassName="space-y-4 min-w-0"
          title="AI Processing"
          description="Tell AI what you want to do with your data"
          icon={<Brain className="w-5 h-5" />}
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
    </div>
  );
}
