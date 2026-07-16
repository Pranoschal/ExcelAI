"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, Plus } from "lucide-react";
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
import type { CreateSheetForm } from "@/hooks/use-dashboard-chat";

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 },
};

interface CreateTabProps {
  isLoading: boolean;
  isProcessing: boolean;
  onCreateSheet: (
    withSampleData: boolean,
    form: CreateSheetForm
  ) => void | Promise<void>;
}

export function CreateTab({
  isLoading,
  isProcessing,
  onCreateSheet,
}: CreateTabProps) {
  const [sheetName, setSheetName] = useState("");
  const [dataType, setDataType] = useState("");
  const [createPrompt, setCreatePrompt] = useState("");

  const form: CreateSheetForm = { sheetName, dataType, createPrompt };
  const busy = isLoading || isProcessing;

  return (
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
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="data-type">Data Type</Label>
              <Input
                id="data-type"
                placeholder="e.g., Employee Records, Sales Data"
                className="mt-2"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
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
              value={createPrompt}
              onChange={(e) => setCreatePrompt(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                onClick={() => onCreateSheet(false, form)}
                disabled={busy}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Sheet
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onCreateSheet(true, form)}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                AI Generate
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
