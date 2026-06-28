import {
  isChatModel,
  isReasoningModel,
  MODELS_CACHE_TTL_MS,
  PREFERRED_MODELS,
  resolveDefaultModel,
} from "./model-config";
import type { GroqModelInfo, GroqModelsResponse } from "./types";

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

  const data = await fetchModelsFromGroq();
  modelsCache = { data, fetchedAt: Date.now() };
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
