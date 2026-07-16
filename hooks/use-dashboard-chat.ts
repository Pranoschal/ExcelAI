"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { useAssistantTts } from "@/hooks/use-assistant-tts";
import { isTtsError } from "@/lib/tts-errors";
import type { UploadedFile } from "@/types/uploaded-file";

export interface CreateSheetForm {
  sheetName: string;
  dataType: string;
  createPrompt: string;
}

interface UseDashboardChatOptions {
  selectedModel: string;
  uploadedFiles: UploadedFile[];
  files: File[];
  isUploading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function useDashboardChat({
  selectedModel,
  uploadedFiles,
  files,
  isUploading,
  activeTab,
  setActiveTab,
}: UseDashboardChatOptions) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const selectedModelRef = useRef(selectedModel);
  const uploadedFilesRef = useRef(uploadedFiles);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevTabRef = useRef(activeTab);

  useEffect(() => {
    selectedModelRef.current = selectedModel;
  }, [selectedModel]);

  useEffect(() => {
    uploadedFilesRef.current = uploadedFiles;
  }, [uploadedFiles]);

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages, id, body }) => ({
        body: {
          ...body,
          id,
          messages,
          selectedModel: selectedModelRef.current,
          uploadedFiles: uploadedFilesRef.current,
        },
      }),
    }),
    onError: (error: Error) => {
      let errorMessage = "An unexpected error occurred";

      try {
        const parsed = JSON.parse(error.message);
        errorMessage = parsed.errorMessage || errorMessage;
      } catch {
        errorMessage = error.message || errorMessage;
      }

      toast("AI Error", {
        description: errorMessage,
        action: {
          label: "Close",
          onClick: () => {},
        },
        className: "bg-slate-800 border-slate-700 text-white",
        descriptionClassName: "text-slate-300",
        actionButtonStyle: {
          backgroundColor: "#2563eb",
          color: "white",
          padding: "6px 12px",
          borderRadius: "6px",
          border: "none",
          fontSize: "12px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.2s ease",
        },
        duration: 3000,
        position: "bottom-right",
      });
    },
    experimental_throttle: 50,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useAssistantTts({
    messages,
    status,
    enabled: ttsEnabled,
    onError: (error) => {
      if (isTtsError(error) && error.code === "model_terms_required") {
        toast("Accept Groq TTS terms to enable read-aloud", {
          description:
            "Open the Groq playground once, accept the Orpheus model terms, then try again.",
          action: error.actionUrl
            ? {
                label: "Open Groq",
                onClick: () =>
                  window.open(error.actionUrl, "_blank", "noopener"),
              }
            : undefined,
          className: "bg-slate-800 border-slate-700 text-white",
          descriptionClassName: "text-slate-300",
          duration: 8000,
          position: "bottom-right",
        });
        return;
      }

      toast("Text-to-speech failed", {
        description: error.message,
        className: "bg-slate-800 border-slate-700 text-white",
        descriptionClassName: "text-slate-300",
        duration: 5000,
        position: "bottom-right",
      });
    },
  });

  useEffect(() => {
    if (
      messagesEndRef.current &&
      (status === "streaming" || status === "submitted")
    ) {
      messagesEndRef.current.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    }
  }, [messages, status]);

  useEffect(() => {
    // Clear chat only when leaving the AI Assistant tab, so Create → AI
    // handoff keeps the new generation request visible.
    if (prevTabRef.current === "ai-chat" && activeTab !== "ai-chat") {
      setMessages([]);
    }
    prevTabRef.current = activeTab;
  }, [activeTab, setMessages]);

  const processWithAI = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isUploading) {
      toast("Please wait", {
        description: "Your file is still uploading.",
        className: "bg-slate-800 border-slate-700 text-white",
        descriptionClassName: "text-slate-300",
        duration: 3000,
        position: "bottom-right",
      });
      return;
    }

    if (files.length > 0 && uploadedFiles.length === 0) {
      toast("Upload incomplete", {
        description:
          "Wait for the file upload to finish before asking the AI to analyze it.",
        className: "bg-slate-800 border-slate-700 text-white",
        descriptionClassName: "text-slate-300",
        duration: 3000,
        position: "bottom-right",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const text = input;
      setInput("");
      await sendMessage(
        { text },
        {
          body: {
            selectedModel,
            uploadedFiles,
          },
        }
      );
    } catch (error) {
      console.error("AI processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSheet = async (
    withSampleData: boolean,
    form: CreateSheetForm
  ) => {
    if (!form.createPrompt.trim()) {
      toast("Describe what you want to create", {
        description: "Add a short description before creating a sheet.",
        className: "bg-slate-800 border-slate-700 text-white",
        descriptionClassName: "text-slate-300",
        duration: 3000,
        position: "bottom-right",
      });
      return;
    }

    if (isLoading) {
      toast("Please wait", {
        description: "The AI is still working on a previous request.",
        className: "bg-slate-800 border-slate-700 text-white",
        descriptionClassName: "text-slate-300",
        duration: 3000,
        position: "bottom-right",
      });
      return;
    }

    const safeName = (form.sheetName.trim() || "new-sheet")
      .replace(/[<>:"/\\|?*]/g, "-")
      .replace(/\s+/g, "-");
    const fileName = safeName.toLowerCase().endsWith(".xlsx")
      ? safeName
      : `${safeName}.xlsx`;

    const message = [
      `Create a new Excel file named "${fileName}".`,
      form.dataType.trim()
        ? `Data type / category: ${form.dataType.trim()}.`
        : "",
      `Requirements: ${form.createPrompt.trim()}`,
      withSampleData
        ? "Use the write_file tool to generate the file with realistic sample data (at least 8–15 rows) and clear column headers."
        : "Use the write_file tool to create the file with an appropriate structure and a few example rows.",
    ]
      .filter(Boolean)
      .join(" ");

    setIsProcessing(true);
    setActiveTab("ai-chat");

    try {
      await sendMessage(
        { text: message },
        {
          body: {
            selectedModel,
            uploadedFiles,
          },
        }
      );
      toast("Creating your sheet", {
        description: "Watch progress in AI Assistant.",
        className: "bg-green-800 border-green-700 text-white",
        descriptionClassName: "text-green-100",
        duration: 3000,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Create sheet error:", error);
      toast("Failed to start creation", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        className: "bg-slate-800 border-slate-700 text-white",
        descriptionClassName: "text-slate-300",
        duration: 3000,
        position: "bottom-right",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTts = () => setTtsEnabled((value) => !value);

  return {
    messages,
    status,
    stop,
    isLoading,
    isProcessing,
    input,
    setInput,
    messagesEndRef,
    processWithAI,
    handleCreateSheet,
    ttsEnabled,
    toggleTts,
  };
}
