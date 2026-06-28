"use client";

import type { GroqModelInfo } from "@/ai/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ModelPickerProps {
  models: GroqModelInfo[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  loading?: boolean;
}

export const ModelPicker = ({
  models,
  selectedModel,
  setSelectedModel,
  loading = false,
}: ModelPickerProps) => {
  return (
    <div className="absolute bottom-2 left-4 flex flex-col gap-2">
      <Select
        value={selectedModel}
        onValueChange={setSelectedModel}
        disabled={loading || models.length === 0}
      >
        <SelectTrigger className="w-auto min-w-[140px] sm:min-w-[180px] h-8 sm:h-10 text-xs sm:text-sm bg-background/80 backdrop-blur-sm border-border/50">
          <SelectValue
            placeholder={loading ? "Loading models..." : "Select a model"}
          />
        </SelectTrigger>
        <SelectContent className="w-auto min-w-[140px] sm:min-w-[180px]">
          <SelectGroup>
            {models.map((model) => (
              <SelectItem
                key={model.id}
                value={model.id}
                className="whitespace-pre-wrap"
              >
                {model.reasoning ? `${model.label} (Reasoning)` : model.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
