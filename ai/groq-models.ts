import {
  isChatModel,
  isReasoningModel,
  MODELS_CACHE_TTL_MS,
  PREFERRED_MODELS,
  resolveDefaultModel,
} from "./model-config";
import type { GroqModelInfo, GroqModelsResponse } from "./types";
import { redis } from "@/lib/redis";

const GROQ_MODELS_CACHE_KEY = "excelai:groq-models:v1";
const GROQ_MODELS_CACHE_TTL_SECONDS = MODELS_CACHE_TTL_MS / 1000;

interface GroqApiModel {
  id: string;
  object?: string;
  owned_by?: string;
}

interface ModelsCache {
  data: GroqModelsResponse;
  fetchedAt: number;
}

let modelsCache: ModelsCache | null = null;

function isGroqModelsResponse(value: unknown): value is GroqModelsResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !("models" in value) ||
    !Array.isArray(value.models) ||
    !("defaultModel" in value) ||
    typeof value.defaultModel !== "string"
  ) {
    return false;
  }

  return value.models.every(
    (model) =>
      typeof model === "object" &&
      model !== null &&
      "id" in model &&
      typeof model.id === "string" &&
      "label" in model &&
      typeof model.label === "string" &&
      "reasoning" in model &&
      typeof model.reasoning === "boolean" &&
      "preferred" in model &&
      typeof model.preferred === "boolean"
  );
}

async function getModelsFromRedis(): Promise<GroqModelsResponse | null> {
  if (!redis) return null;

  try {
    const cachedModels = await redis.get<unknown>(GROQ_MODELS_CACHE_KEY);
    return isGroqModelsResponse(cachedModels) ? cachedModels : null;
  } catch (error) {
    console.warn("Failed to read Groq models from Redis:", error);
    return null;
  }
}

async function cacheModelsInRedis(data: GroqModelsResponse): Promise<void> {
  if (!redis) return;

  try {
    await redis.set(GROQ_MODELS_CACHE_KEY, data, {
      ex: GROQ_MODELS_CACHE_TTL_SECONDS,
    });
  } catch (error) {
    console.warn("Failed to cache Groq models in Redis:", error);
  }
}

function sortModels(models: GroqModelInfo[]): GroqModelInfo[] {
  return [...models].sort((a, b) => {
    if (a.preferred !== b.preferred) {
      return a.preferred ? -1 : 1;
    }
    return a.label.localeCompare(b.label);
  });
}

function buildModelList(ids: string[]): GroqModelInfo[] {
  const models = ids.map((id) => ({
    id,
    label: id,
    reasoning: isReasoningModel(id),
    preferred: PREFERRED_MODELS.includes(id),
  }));

  return sortModels(models);
}

async function fetchModelsFromGroq(): Promise<GroqModelsResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.groq.com/openai/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    next: { revalidate: MODELS_CACHE_TTL_MS / 1000 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch Groq models (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as { data?: GroqApiModel[] };
  const chatModelIds = (payload.data ?? [])
    .map((entry) => entry.id)
    .filter(isChatModel);

  if (chatModelIds.length === 0) {
    throw new Error("No chat models returned from Groq");
  }

  const models = buildModelList(chatModelIds);
  const defaultModel = resolveDefaultModel(chatModelIds);

  return { models, defaultModel };
}

export async function getGroqModels(
  forceRefresh = false
): Promise<GroqModelsResponse> {
  const isCacheValid =
    modelsCache &&
    Date.now() - modelsCache.fetchedAt < MODELS_CACHE_TTL_MS;

  if (!forceRefresh && isCacheValid && modelsCache) {
    return modelsCache.data;
  }

  if (!forceRefresh) {
    const cachedModels = await getModelsFromRedis();
    if (cachedModels) {
      modelsCache = { data: cachedModels, fetchedAt: Date.now() };
      return cachedModels;
    }
  }

  const data = await fetchModelsFromGroq();
  modelsCache = { data, fetchedAt: Date.now() };
  await cacheModelsInRedis(data);
  return data;
}

export async function resolveChatModel(
  requestedModel?: string
): Promise<{ modelId: string; reasoning: boolean }> {
  const { models, defaultModel } = await getGroqModels();
  const availableIds = models.map((model) => model.id);

  const modelId =
    requestedModel && availableIds.includes(requestedModel)
      ? requestedModel
      : defaultModel;

  const match = models.find((model) => model.id === modelId);

  return {
    modelId,
    reasoning: match?.reasoning ?? isReasoningModel(modelId),
  };
}
