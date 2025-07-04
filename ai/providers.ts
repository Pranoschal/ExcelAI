import { groq } from "@ai-sdk/groq";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";

const languageModels = {
    "qwen-qwq-32b" : wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: "think",
    }),
    model: groq("qwen-qwq-32b"),
  }),
  "qwen/qwen3-32b" :  wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: "think",
    }),
    model: groq("qwen/qwen3-32b"),
  }),
   "deepseek-r1-distill-llama-70b": wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: "think",
    }),
    model: groq("deepseek-r1-distill-llama-70b"),
  }),
//   "meta-llama/llama-4-scout-17b-16e-instruct": groq(
//     "meta-llama/llama-4-scout-17b-16e-instruct",
//   ),
  "llama-3.1-8b-instant": groq("llama-3.1-8b-instant"),
  "llama-3.3-70b-versatile": groq("llama-3.3-70b-versatile"),
   "mistral-saba-24b" : groq("mistral-saba-24b"),
   "distil-whisper-large-v3-en" : groq("distil-whisper-large-v3-en"),
//    "meta-llama/llama-4-maverick-17b-128e-instruct" : groq("meta-llama/llama-4-maverick-17b-128e-instruct")
};

// Reasoning Models
export const reasoningModelNames = ["qwen-qwq-32b","qwen/qwen3-32b","deepseek-r1-distill-llama-70b"]

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID =
  "qwen-qwq-32b";