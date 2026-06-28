import { groq } from "@ai-sdk/groq";
import { extractReasoningMiddleware, wrapLanguageModel } from "ai";
import { isReasoningModel } from "./model-config";

export type modelID = string;

export function getLanguageModel(modelId: string) {
  const baseModel = groq(modelId);

  if (!isReasoningModel(modelId)) {
    return baseModel;
  }

  return wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: "think",
    }),
    model: baseModel,
  });
}
