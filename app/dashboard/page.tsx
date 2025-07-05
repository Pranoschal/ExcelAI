"use client";

import { defaultModel, modelID } from "@/ai/providers";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Download,
  FileSpreadsheet,
  Brain,
  Sparkles,
  Plus,
  Table,
  MessageSquare,
  Loader2,
  CheckCircle,
  Home,
  User,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { openai } from "@ai-sdk/openai";
import { Message, useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";
import ToolsShowcase from "@/components/tool-displayer";
import { toast } from "sonner";
import { TextArea } from "@/components/customized-textarea";
import { UIMessage } from "ai";
import { ReasoningMessagePart } from "@/components/reasoning";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 },
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [aiResponse, setAiResponse] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
  const validExtensions = [".xlsx", ".xls", ".csv"];

  try {
    const filteredFiles = acceptedFiles.filter((file) => {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!validExtensions.includes(ext)) {
        throw new Error(`Unsupported file type: ${ext}`);
      }
      return true;
    });

    setFiles((prev) => [...prev, ...filteredFiles]);
    
    // Upload files to server
    const formData = new FormData();
    filteredFiles.forEach((file) => {
      formData.append('files', file);
    });
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.success) {
      setUploadedFiles((prev) => [...prev, ...result.files]);
      toast("Files uploaded successfully!", {
        className: "bg-green-800 border-green-700 text-white",
        duration: 3000,
        position: "bottom-right",
      });
    }
  } catch (error) {
    console.error("File validation error:", error);
    toast("File upload error", {
      description: error instanceof Error ? error.message : "Invalid file uploaded,only xlsx, xls and csv supported.",
      className: "bg-slate-800 border-slate-700 text-white",
      descriptionClassName: "text-slate-300",
      duration: 3000,
      position: "bottom-right",
    });
  }
}, []);

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    isLoading,
    stop,
  } = useChat({
    api: "/api/chat",
    body: {
      selectedModel,
      uploadedFiles,
    },
    onError: (error: Error) => {
      let errorMessage = "An unexpected error occurred";

      try {
        const parsed = JSON.parse(error.message);
        errorMessage = parsed.errorMessage || errorMessage;
      } catch (parseError) {
        errorMessage = error.message || errorMessage;
      }

      toast("AI Error", {
        description: errorMessage,
        action: {
          label: "Close",
          onClick: () => console.log("Close clicked"),
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(messages, "Messages");
  }, [messages]);
  useEffect(() => {
    if (
      messagesEndRef.current &&
      (status === "streaming" || status === "submitted")
    ) {
      scrollToBottom();
    }
  }, [messages, status]);

  // And modify the scrollToBottom function to be more performant:
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "auto", // Use "auto" instead of "smooth" for streaming
        block: "end",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
  });

  const processWithAI = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsProcessing(true);

    try {
      await handleSubmit(e);
    } catch (error) {
      console.log("AI processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    setMessages([]);
  }, [activeTab]);


  // useEffect(() => {
  //   // Get the last message
  //   const lastMessage = messages[messages.length - 1];
  //   console.log("Calling", lastMessage);
  //   console.log(isLoading, "IS LOADING?");
  //   console.log(status, "TSTATUS?");
  //   if (
  //     lastMessage &&
  //     lastMessage.role === "assistant" &&
  //     lastMessage.content &&
  //     status === "ready"
  //   ) {
  //     console.log("Calling API");
  //     createAudio(lastMessage.content);
  //   }
  // }, [messages, status]);

  // const createAudio = async (text: string) => {
  //   try {
  //     const response = await fetch("/api/tts", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ text }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to generate speech");
  //     }

  //     const audioBlob = await response.blob();
  //     const audioUrl = URL.createObjectURL(audioBlob);
  //     const audioElement = new Audio(audioUrl);

  //     audioElement.play();

  //     audioElement.addEventListener("ended", () => {
  //       URL.revokeObjectURL(audioUrl);
  //     });
  //   } catch (error) {
  //     console.error("Error playing audio:", error);
  //   }
  // };

  const downloadExcel = () => {
    // Simulate Excel download
    const csvContent = processedData
      .map((row) => Object.values(row).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "processed_data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const createNewSheet = () => {
    const newData = [
      { Column1: "Sample Data 1", Column2: "Value 1", Column3: 100 },
      { Column1: "Sample Data 2", Column2: "Value 2", Column3: 200 },
      { Column1: "Sample Data 3", Column2: "Value 3", Column3: 300 },
    ];
    setProcessedData(newData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </div>
          </div>

          <Badge variant="secondary" className="hidden sm:flex">
            <Sparkles className="w-4 h-4 mr-1" />
            AI Powered
          </Badge>
        </div>
      </motion.header>

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
          value="upload"
          onValueChange={handleTabChange}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload */}
              <motion.div
                variants={slideIn}
                initial="initial"
                animate="animate"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Excel Files
                    </CardTitle>
                    <CardDescription>
                      Drag and drop your Excel files or click to browse
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      onClick={getRootProps().onClick}
                      onKeyDown={getRootProps().onKeyDown}
                      onFocus={getRootProps().onFocus}
                      onBlur={getRootProps().onBlur}
                      onDrop={getRootProps().onDrop}
                      onDragOver={getRootProps().onDragOver}
                      onDragEnter={getRootProps().onDragEnter}
                      onDragLeave={getRootProps().onDragLeave}
                      tabIndex={getRootProps().tabIndex}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          : "border-slate-300 dark:border-slate-700 hover:border-blue-400"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input {...getInputProps()} />
                      <motion.div
                        animate={{ y: isDragActive ? -5 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        {isDragActive ? (
                          <p className="text-blue-600 dark:text-blue-400 font-medium">
                            Drop the files here...
                          </p>
                        ) : (
                          <div>
                            <p className="text-slate-600 dark:text-slate-300 mb-2">
                              Drag & drop Excel files here, or click to select
                            </p>
                            <p className="text-sm text-slate-500">
                              Supports .xlsx, .xls, and .csv files
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>

                    <AnimatePresence>
                      {files.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-2"
                        >
                          <Label className="text-sm font-medium">
                            Uploaded Files:
                          </Label>
                          {files.map((file, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm truncate">
                                {file.name}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {(file.size / 1024).toFixed(1)} KB
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Processing */}
              <motion.div
                variants={slideIn}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Processing
                    </CardTitle>
                    <CardDescription>
                      Tell AI what you want to do with your data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-[28vh] sm:h-[50vh] md:h-[47vh] lg:h-[42vh] xl:h-[38vh] 2xl:h-[35vh] w-full mx-auto border rounded-lg p-4 bg-slate-50 dark:bg-slate-900 overflow-y-auto break-words overflow-wrap-anywhere">
                      {" "}
                      {messages.map((message: Message) => {
                        return (
                          <div
                            key={message.id}
                            className={`flex items-start gap-3 mb-4 ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {/* Avatar for user messages */}
                            {message.role === "user" && (
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {/* Avatar for non-user messages */}
                            {message.role !== "user" && (
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {/* Message bubble */}
                            <div
                              className={`rounded-lg p-3 max-w-[80%] ${
                                message.role === "user"
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                              }`}
                            >
                              {/* Message header */}
                              <div className="flex items-center mb-1">
                                {message.role === "user" ? (
                                  <User className="h-4 w-4 mr-2" />
                                ) : (
                                  <Brain className="h-4 w-4 mr-2" />
                                )}
                                <span className="font-semibold text-sm">
                                  {message.role === "user"
                                    ? "You"
                                    : "AI Assistant"}
                                </span>
                              </div>
                              {message.parts &&
                                message.parts.map((part, index) => {
                                  if (part.type === "reasoning") {
                                  
                                    return (
                                      <ReasoningMessagePart
                                        key={`${message.id}-${index}`}
                                        // @ts-expect-error export ReasoningUIPart
                                        part={part}
                                        isReasoning={
                                          status === "streaming" &&
                                          index === (message.parts?.length ?? 0) - 1
                                        }
                                      />
                                    );
                                  }
                                  if (
                                    part.type === "tool-invocation" &&
                                    part.toolInvocation?.state === "result"
                                  ) {
                                    const toolName =
                                      part.toolInvocation.toolName;
                                    if (toolName == "showAllExcelTools") {
                                      return (
                                        <div key={index}>
                                          <ToolsShowcase />
                                        </div>
                                      );
                                    }
                                  }
                                  return null;
                                })}
                              {/* Message content */}
                              {message.content && (
                                <Markdown>{message.content}</Markdown>
                              )}
                              
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={processWithAI} className="flex space-x-2">
                      <div className="w-full">
                        <TextArea
                          selectedModel={selectedModel}
                          setSelectedModel={setSelectedModel}
                          handleInputChange={handleInputChange}
                          input={input}
                          isLoading={isLoading}
                          status={status}
                          stop={stop}
                        />
                      </div>
                    </form>
                    {/* <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        // onClick={processWithAI}
                        disabled={isProcessing || !aiPrompt.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Process with AI
                          </>
                        )}
                      </Button>
                    </motion.div> */}

                    <AnimatePresence>
                      {aiResponse && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                        >
                          <div className="flex items-start gap-2">
                            <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                AI Response:
                              </Label>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                {aiResponse}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Data Preview */}
            <AnimatePresence>
              {processedData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Table className="w-5 h-5" />
                          Data Preview
                        </CardTitle>
                        <CardDescription>
                          Preview of your processed data
                        </CardDescription>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={downloadExcel}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Excel
                        </Button>
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-300 dark:border-slate-700">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800">
                              {Object.keys(processedData[0] || {}).map(
                                (key) => (
                                  <th
                                    key={key}
                                    className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left font-medium"
                                  >
                                    {key}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {processedData.map((row, index) => (
                              <motion.tr
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              >
                                {Object.values(row).map((value, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="border border-slate-300 dark:border-slate-700 px-4 py-2"
                                  >
                                    {String(value)}
                                  </td>
                                ))}
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <motion.div variants={slideIn} initial="initial" animate="animate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Excel Sheet
                  </CardTitle>
                  <CardDescription>
                    Generate new Excel files with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sheet-name">Sheet Name</Label>
                      <Input
                        id="sheet-name"
                        placeholder="My New Spreadsheet"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="data-type">Data Type</Label>
                      <Input
                        id="data-type"
                        placeholder="e.g., Employee Records, Sales Data"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="create-prompt">
                      Describe what you want to create
                    </Label>
                    <Textarea
                      id="create-prompt"
                      placeholder="e.g., 'Create a monthly budget tracker with categories for income and expenses'"
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  {/* Alternative: Equal width buttons on all screens */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        onClick={createNewSheet}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Sheet
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Generate
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="ai-chat" className="space-y-6">
            <motion.div variants={slideIn} initial="initial" animate="animate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    AI Assistant
                  </CardTitle>
                  <CardDescription>
                    Chat with AI about your Excel needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-[28vh] sm:h-[50vh] md:h-[47vh] lg:h-[42vh] xl:h-[38vh] 2xl:h-[35vh] w-full mx-auto border rounded-lg p-4 bg-slate-50 dark:bg-slate-900 overflow-y-auto break-words overflow-wrap-anywhere">
                      {" "}
                      {messages.map((message: Message) => {
                        return (
                          <div
                            key={message.id}
                            className={`flex items-start gap-3 mb-4 ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {/* Avatar for user messages */}
                            {message.role === "user" && (
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {/* Avatar for non-user messages */}
                            {message.role !== "user" && (
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {/* Message bubble */}
                            <div
                              className={`rounded-lg p-3 max-w-[80%] ${
                                message.role === "user"
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                              }`}
                            >
                              {/* Message header */}
                              <div className="flex items-center mb-1">
                                {message.role === "user" ? (
                                  <User className="h-4 w-4 mr-2" />
                                ) : (
                                  <Brain className="h-4 w-4 mr-2" />
                                )}
                                <span className="font-semibold text-sm">
                                  {message.role === "user"
                                    ? "You"
                                    : "AI Assistant"}
                                </span>
                              </div>
                              {/* Message content */}
                              {message.content && (
                                <Markdown>{message.content}</Markdown>
                              )}
                              {message.parts &&
                                message.parts.map((part, index) => {
                                  // if (part.type === "reasoning") {
                                  //   return (
                                  //     (status === "submitted" ||
                                  //       status === "streaming") && (
                                  //       <pre
                                  //         key={index}
                                  //         className="max-w-[80%] whitespace-pre-wrap"
                                  //       >
                                  //         {part.details.map((detail) =>
                                  //           detail.type === "text"
                                  //             ? detail.text
                                  //             : "<redacted>"
                                  //         )}
                                  //       </pre>
                                  //     )
                                  //   );
                                  // }
                                  if (
                                    part.type === "tool-invocation" &&
                                    part.toolInvocation?.state === "result"
                                  ) {
                                    const toolName =
                                      part.toolInvocation.toolName;
                                    if (toolName == "showAllExcelTools") {
                                      return (
                                        <div key={index}>
                                          <ToolsShowcase />
                                        </div>
                                      );
                                    }
                                  }
                                  return null;
                                })}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={processWithAI} className="flex space-x-2">
                      {/* <Input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask me anything about Excel..."
                        className="flex-1"
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="submit"
                          disabled={
                            status === "submitted" || status === "streaming"
                          }
                        >
                          {status === "submitted" || status === "streaming" ? (
                            "Thinking...."
                          ) : (
                            <MessageSquare className="w-4 h-4" />
                          )}
                        </Button>
                      </motion.div> */}
                      <TextArea
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                        handleInputChange={handleInputChange}
                        input={input}
                        isLoading={isLoading}
                        status={status}
                        stop={stop}
                      />
                    </form>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
