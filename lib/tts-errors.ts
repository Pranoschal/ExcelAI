export class TtsError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly actionUrl?: string
  ) {
    super(message);
    this.name = "TtsError";
  }
}

export function isTtsError(error: unknown): error is TtsError {
  return error instanceof TtsError;
}
