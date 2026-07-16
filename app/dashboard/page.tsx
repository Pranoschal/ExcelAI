"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiChatTab } from "@/components/dashboard/ai-chat-tab";
import { CreateTab } from "@/components/dashboard/create-tab";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UploadTab } from "@/components/dashboard/upload-tab";
import { useDashboardChat } from "@/hooks/use-dashboard-chat";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useModels } from "@/hooks/use-models";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const { models, defaultModel, loading: modelsLoading, error: modelsError } =
    useModels();
  const [selectedModel, setSelectedModel] = useState("");

  const {
    files,
    uploadedFiles,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
  } = useFileUpload();

  const chat = useDashboardChat({
    selectedModel,
    uploadedFiles,
    files,
    isUploading,
    activeTab,
    setActiveTab,
  });

  useEffect(() => {
    if (!defaultModel || models.length === 0) return;

    const isValidSelection = models.some((model) => model.id === selectedModel);
    if (!selectedModel || !isValidSelection) {
      setSelectedModel(defaultModel);
    }
  }, [defaultModel, models, selectedModel]);

  useEffect(() => {
    if (!modelsError) return;

    toast("Failed to load AI models", {
      description: modelsError,
      className: "bg-slate-800 border-slate-700 text-white",
      descriptionClassName: "text-slate-300",
      duration: 5000,
      position: "bottom-right",
    });
  }, [modelsError]);

  const chatPanelProps = {
    messages: chat.messages,
    status: chat.status,
    messagesEndRef: chat.messagesEndRef,
    models,
    modelsLoading,
    selectedModel,
    setSelectedModel,
    input: chat.input,
    setInput: chat.setInput,
    isLoading: chat.isLoading,
    stop: chat.stop,
    onSubmit: chat.processWithAI,
    ttsEnabled: chat.ttsEnabled,
    onToggleTts: chat.toggleTts,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-blue-800 dark:from-slate-100 dark:to-blue-200 bg-clip-text text-transparent">
            Excel AI Workspace
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Upload, process, and create Excel files with the power of AI
          </p>
        </motion.div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload & Process</span>
              <span className="sm:hidden">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create New</span>
              <span className="sm:hidden">Create</span>
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <UploadTab
              files={files}
              uploadedFiles={uploadedFiles}
              isUploading={isUploading}
              isDragActive={isDragActive}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              {...chatPanelProps}
            />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <CreateTab
              isLoading={chat.isLoading}
              isProcessing={chat.isProcessing}
              onCreateSheet={chat.handleCreateSheet}
            />
          </TabsContent>

          <TabsContent value="ai-chat" className="space-y-6">
            <AiChatTab {...chatPanelProps} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
