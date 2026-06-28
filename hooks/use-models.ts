"use client";

import { useEffect, useState } from "react";
import type { GroqModelInfo, GroqModelsResponse } from "@/ai/types";

interface UseModelsResult {
  models: GroqModelInfo[];
  defaultModel: string;
  loading: boolean;
  error: string | null;
}

export function useModels(): UseModelsResult {
  const [models, setModels] = useState<GroqModelInfo[]>([]);
  const [defaultModel, setDefaultModel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      try {
        const response = await fetch("/api/models");
        const data = (await response.json()) as
          | GroqModelsResponse
          | { errorMessage?: string };

        if (!response.ok) {
          throw new Error(
            "errorMessage" in data && data.errorMessage
              ? data.errorMessage
              : "Failed to load models"
          );
        }

        if (cancelled) return;

        const modelsResponse = data as GroqModelsResponse;
        setModels(modelsResponse.models);
        setDefaultModel(modelsResponse.defaultModel);
        setError(null);
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load models"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      cancelled = true;
    };
  }, []);

  return { models, defaultModel, loading, error };
}
