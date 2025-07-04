"use client";
import { modelID, MODELS } from "@/ai/providers";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { reasoningModelNames } from "@/ai/providers";

interface ModelPickerProps {
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
}

export const ModelPicker = ({
  selectedModel,
  setSelectedModel,
}: ModelPickerProps) => {
    console.log(reasoningModelNames)
  return (
    <div className="absolute bottom-2 left-4 flex flex-col gap-2">
      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger className="w-auto min-w-[140px] sm:min-w-[180px] h-8 sm:h-10 text-xs sm:text-sm bg-background/80 backdrop-blur-sm border-border/50">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent className="w-auto min-w-[140px] sm:min-w-[180px]">
          <SelectGroup>
            {MODELS.map((modelId) => (
              <SelectItem
                key={modelId}
                value={modelId}
                className="whitespace-pre-wrap"
              >
                {reasoningModelNames.includes(modelId)
                  ? `${modelId} (Reasoning)`
                  : modelId}{" "}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
