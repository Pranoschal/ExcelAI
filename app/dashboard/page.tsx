"use client";

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
} from "lucide-react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { useChat } from '@ai-sdk/react'

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
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [aiResponse, setAiResponse] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onResponse(response) {
      console.log("Got Response", response);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


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

    if (!aiPrompt.trim()) return;
    setIsProcessing(true);
    try {
      await handleSubmit(e);
      // Simulate processed data
      const sampleData = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          department: "Engineering",
          salary: 75000,
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          department: "Marketing",
          salary: 65000,
        },
        {
          id: 3,
          name: "Mike Johnson",
          email: "mike@example.com",
          department: "Sales",
          salary: 70000,
        },
        {
          id: 4,
          name: "Sarah Wilson",
          email: "sarah@example.com",
          department: "HR",
          salary: 60000,
        },
        {
          id: 5,
          name: "David Brown",
          email: "david@example.com",
          department: "Finance",
          salary: 80000,
        },
      ];
      setProcessedData(sampleData);

    } catch (error) {
      console.error("AI processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

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

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-blue-800 dark:from-slate-100 dark:to-blue-200 bg-clip-text text-transparent">
            Excel AI Workspace
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Upload, process, and create Excel files with the power of AI
          </p>
        </motion.div>

        <Tabs defaultValue="upload" className="space-y-6">
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
                    <div>
                      <Label htmlFor="ai-prompt">AI Instructions</Label>
                      <Textarea
                        id="ai-prompt"
                        placeholder="e.g., 'Analyze sales data and create a summary report' or 'Generate employee performance metrics'"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="mt-2 min-h-[100px]"
                      />
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={processWithAI}
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
                    </motion.div>

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

                  <div className="flex gap-4">
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
                    >
                      <Button variant="outline">
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
                  <div className="space-y-4">
                    <div className="h-64 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 max-w-[80%]">
                          <p className="text-sm">
                            Hello! I'm your Excel AI assistant. I can help you
                            create, modify, and analyze Excel files. What would
                            you like to work on today?
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask me anything about Excel..."
                        className="flex-1"
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>
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
