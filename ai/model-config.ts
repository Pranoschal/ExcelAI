export const DEFAULT_MODEL = "qwen/qwen3-32b";

/** Shown first in the picker when available from Groq */
export const PREFERRED_MODELS = [
  "qwen/qwen3-32b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-120b",
];

/** Substrings that indicate a model is not for text chat */
export const EXCLUDED_SUBSTRINGS = [
  "whisper",
  "distil-whisper",
  "orpheus",
  "playai",
  "prompt-guard",
  "safeguard",
  "embedding",
  "tts",
];

/** Regex patterns for models that emit reasoning tokens */
export const REASONING_PATTERNS = [
  /qwen3/i,
  /qwq/i,
  /gpt-oss/i,
  /deepseek-r1/i,
  /kimi-k2/i,
];

export const MODELS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function isReasoningModel(modelId: string): boolean {
  return REASONING_PATTERNS.some((pattern) => pattern.test(modelId));
}

export function isChatModel(modelId: string): boolean {
  const lower = modelId.toLowerCase();
  return !EXCLUDED_SUBSTRINGS.some((substring) => lower.includes(substring));
}

export function resolveDefaultModel(availableIds: string[]): string {
  const envDefault = process.env.GROQ_DEFAULT_MODEL;
  if (envDefault && availableIds.includes(envDefault)) {
    return envDefault;
  }

  for (const preferred of PREFERRED_MODELS) {
    if (availableIds.includes(preferred)) {
      return preferred;
    }
  }

  return availableIds[0] ?? DEFAULT_MODEL;
}
