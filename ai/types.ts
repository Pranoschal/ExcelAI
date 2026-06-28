export interface GroqModelInfo {
  id: string;
  label: string;
  reasoning: boolean;
  preferred: boolean;
}

export interface GroqModelsResponse {
  models: GroqModelInfo[];
  defaultModel: string;
}
