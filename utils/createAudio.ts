 import { experimental_generateSpeech as generateSpeech } from "ai";
import { groq } from "@ai-sdk/groq";
export default async function  createAudio(text: string) {
  try {
    if (!groq.speechModel) {
      console.error('Speech model not available');
      return;
    }
    
    const audio = await generateSpeech({
      model: groq.speechModel("playai-tts"),
      text: text,
    });
    
    console.log(audio,'AUDIO')
    // Convert to playable audio and autoplay
    // const audioBlob = new Blob([audio], { type: 'audio/mpeg' });
    // const audioUrl = URL.createObjectURL(audioBlob);
    // const audioElement = new Audio(audioUrl);
    
    // // Autoplay the audio
    // audioElement.play();
    
    // // Clean up when done
    // audioElement.addEventListener('ended', () => {
    //   URL.revokeObjectURL(audioUrl);
    // });
    
  } catch (error) {
    console.error('Error generating speech:', error);
  }
};