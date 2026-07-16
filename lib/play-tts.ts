import { TtsError } from "@/lib/tts-errors";

interface PreparedAudio {
  blob?: Blob;
  error?: Error;
}

interface QueueItem {
  generation: number;
  text: string;
  prepare?: Promise<PreparedAudio>;
  resolve: () => void;
  reject: (error: Error) => void;
}

let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;
let cancelCurrentPlayback: (() => void) | null = null;
let queueGeneration = 0;
let isProcessingQueue = false;
const queue: QueueItem[] = [];
const activeRequests = new Set<AbortController>();
const SPEAKABLE_TEXT_PATTERN = /[\p{L}\p{N}]/u;

function hasSpeakableText(text: string): boolean {
  return SPEAKABLE_TEXT_PATTERN.test(text);
}

async function generateAudio(
  text: string,
  controller: AbortController
): Promise<Blob> {
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        code?: string;
        actionUrl?: string;
      } | null;

      throw new TtsError(
        body?.error ?? "Failed to generate speech",
        body?.code,
        body?.actionUrl
      );
    }

    return response.blob();
  } finally {
    activeRequests.delete(controller);
  }
}

function startPrepare(item: QueueItem): Promise<PreparedAudio> {
  if (item.prepare) return item.prepare;

  const controller = new AbortController();
  activeRequests.add(controller);

  item.prepare = generateAudio(item.text, controller).then(
    (blob) => ({ blob }),
    (error) => ({
      error:
        error instanceof Error ? error : new Error("TTS generation failed"),
    })
  );

  return item.prepare;
}

function playAudioBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      URL.revokeObjectURL(url);

      if (currentAudio === audio) {
        currentAudio = null;
        currentAudioUrl = null;
        cancelCurrentPlayback = null;
      }

      if (error) reject(error);
      else resolve();
    };

    const handleEnded = () => finish();
    const handleError = () =>
      finish(new TtsError("Unable to play generated speech"));

    currentAudio = audio;
    currentAudioUrl = url;
    cancelCurrentPlayback = () => {
      audio.pause();
      finish();
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.play().catch((error) => {
      finish(error instanceof Error ? error : new Error("Audio playback failed"));
    });
  });
}

async function processQueue(): Promise<void> {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  try {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) continue;

      if (item.generation !== queueGeneration) {
        item.resolve();
        continue;
      }

      const prepared = await startPrepare(item);
      if (item.generation !== queueGeneration) {
        item.resolve();
        continue;
      }

      if (prepared.error) {
        stopTts();
        item.reject(prepared.error);
        continue;
      }

      // Prefetch the next chunk while this one plays (at most one ahead).
      const next = queue[0];
      if (next && next.generation === queueGeneration) {
        void startPrepare(next);
      }

      try {
        if (prepared.blob) await playAudioBlob(prepared.blob);
        item.resolve();
      } catch (error) {
        stopTts();
        item.reject(
          error instanceof Error ? error : new Error("TTS playback failed")
        );
      }
    }
  } finally {
    isProcessingQueue = false;
    if (queue.length > 0) void processQueue();
  }
}

export function enqueueTts(text: string): Promise<void> {
  const normalizedText = text.trim();
  if (!normalizedText || !hasSpeakableText(normalizedText)) {
    return Promise.resolve();
  }

  const completion = new Promise<void>((resolve, reject) => {
    queue.push({
      generation: queueGeneration,
      text: normalizedText,
      resolve,
      reject,
    });
  });

  void processQueue();
  return completion;
}

export function stopTts(): void {
  queueGeneration += 1;
  activeRequests.forEach((controller) => controller.abort());
  activeRequests.clear();
  cancelCurrentPlayback?.();
  cancelCurrentPlayback = null;
  currentAudio = null;

  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }

  while (queue.length > 0) {
    queue.shift()?.resolve();
  }
}

export async function playTts(text: string): Promise<void> {
  stopTts();
  await enqueueTts(text);
}
