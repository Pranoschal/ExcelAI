/**
 * Speech generation helper.
 * Groq's AI SDK provider no longer exposes a speech model in v4,
 * so this is currently a no-op stub for compatibility with older call sites.
 */
export default async function createAudio(text: string) {
  console.warn(
    "createAudio: speech models are not available on @ai-sdk/groq v4. Skipped for:",
    text.slice(0, 80)
  );
}
