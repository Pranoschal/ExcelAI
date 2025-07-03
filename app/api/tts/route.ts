import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return new Response('Text is required', { status: 400 });
    }
    
    const wav = await groq.audio.speech.create({
      model: "playai-tts",
      voice: "Aaliyah-PlayAI",
      response_format: "wav",
      input: text,
    });
    
    const buffer = Buffer.from(await wav.arrayBuffer());
    
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('TTS Error:', error);
    return new Response('Failed to generate speech', { status: 500 });
  }
}