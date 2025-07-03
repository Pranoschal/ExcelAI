import { groq } from "@ai-sdk/groq";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";

const languageModels = {
//   "meta-llama/llama-4-scout-17b-16e-instruct": groq(
//     "meta-llama/llama-4-scout-17b-16e-instruct",
//   ),
//   "llama-3.1-8b-instant": groq("llama-3.1-8b-instant"),
  "deepseek-r1-distill-llama-70b": wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: "think",
    }),
    model: groq("deepseek-r1-distill-llama-70b"),
  }),
//   "llama-3.3-70b-versatile": groq("llama-3.3-70b-versatile"),
  "qwen-qwq-32b" : groq("qwen-qwq-32b"),
  "mistral-saba-24b" : groq("mistral-saba-24b")
};

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID =
  "qwen-qwq-32b";