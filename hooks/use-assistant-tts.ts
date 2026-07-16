import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { getMessageText } from "@/lib/get-message-text";
import { enqueueTts, stopTts } from "@/lib/play-tts";

const MAX_TTS_CHARS = 180;

function findStreamingBoundary(text: string): number {
  let readyLength = 0;
  const sentenceBoundary = /[.!?](?:["')\]]*)?(?:\s+|$)|\n+/g;

  for (const match of text.matchAll(sentenceBoundary)) {
    readyLength = (match.index ?? 0) + match[0].length;
  }

  while (text.length - readyLength > MAX_TTS_CHARS) {
    const limit = readyLength + MAX_TTS_CHARS;
    const candidate = text.slice(readyLength, limit + 1);
    const splitAt = Math.max(
      candidate.lastIndexOf(" "),
      candidate.lastIndexOf("\n")
    );
    readyLength += splitAt > 0 ? splitAt + 1 : MAX_TTS_CHARS;
  }

  return readyLength;
}

function splitForTts(text: string): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > MAX_TTS_CHARS) {
    const candidate = remaining.slice(0, MAX_TTS_CHARS + 1);
    const splitAt = Math.max(
      candidate.lastIndexOf(" "),
      candidate.lastIndexOf("\n")
    );
    const end = splitAt > 0 ? splitAt : MAX_TTS_CHARS;
    chunks.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(end).trimStart();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

interface UseAssistantTtsOptions {
  messages: UIMessage[];
  status: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useAssistantTts({
  messages,
  status,
  enabled = true,
  onError,
}: UseAssistantTtsOptions) {
  const activeMessageIdRef = useRef<string | null>(null);
  const consumedLengthRef = useRef(0);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    return () => stopTts();
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopTts();
      activeMessageIdRef.current = null;
      consumedLengthRef.current = 0;
      return;
    }

    const lastMessage = messages.at(-1);
    if (!lastMessage || lastMessage.role !== "assistant") {
      if (activeMessageIdRef.current !== null) {
        stopTts();
        activeMessageIdRef.current = null;
        consumedLengthRef.current = 0;
      }
      return;
    }

    const text = getMessageText(lastMessage);
    if (!text) return;

    if (activeMessageIdRef.current !== lastMessage.id) {
      stopTts();
      activeMessageIdRef.current = lastMessage.id;
      consumedLengthRef.current = 0;
    }

    if (text.length < consumedLengthRef.current) {
      stopTts();
      consumedLengthRef.current = 0;
    }

    const pendingText = text.slice(consumedLengthRef.current);
    const readyLength =
      status === "ready" ? pendingText.length : findStreamingBoundary(pendingText);

    if (readyLength === 0) return;

    const chunks = splitForTts(pendingText.slice(0, readyLength));
    consumedLengthRef.current += readyLength;

    for (const chunk of chunks) {
      enqueueTts(chunk).catch((error) => {
        console.error("TTS playback failed:", error);
        onErrorRef.current?.(
          error instanceof Error ? error : new Error("TTS playback failed")
        );
      });
    }
  }, [messages, status, enabled]);
}
