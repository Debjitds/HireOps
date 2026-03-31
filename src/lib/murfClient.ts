// Murf Falcon API client for voice output
// Streams TTS audio and plays in the browser

const MURF_API_KEY = import.meta.env.VITE_MURF_API_KEY || '';
const MURF_API_URL = 'https://api.murf.ai/v1/speech/generate';

// Default voice IDs - configurable per persona/language
const DEFAULT_VOICES: Record<string, string> = {
  'English': 'en-US-natalie',
  'Hindi': 'hi-IN-om',
  'Spanish': 'es-ES-alejandro',
  'French': 'fr-FR-jean',
  'German': 'de-DE-konrad',
  'Japanese': 'ja-JP-akemi',
  'Chinese': 'zh-CN-xiaoxiao',
  'Korean': 'ko-KR-seon-hi',
  'Arabic': 'ar-SA-salim',
  'Portuguese': 'pt-BR-rodrigo',
};

export interface MurfConfig {
  voiceId?: string;
  speed?: number;
  pitch?: number;
}

export async function speak(
  text: string,
  language: string = 'English',
  config: MurfConfig = {}
): Promise<void> {
  const voiceId = config.voiceId || DEFAULT_VOICES[language] || DEFAULT_VOICES['English'];

  // First try Murf API
  if (MURF_API_KEY) {
    try {
      const response = await fetch(MURF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': MURF_API_KEY,
        },
        body: JSON.stringify({
          voiceId,
          text,
          speed: config.speed || 1.0,
          pitch: config.pitch || 0,
          format: 'MP3',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioFile) {
          return playAudioUrl(data.audioFile);
        }
      }
    } catch (err) {
      console.warn('Murf API failed, falling back to browser TTS:', err);
    }
  }

  // Fallback: Browser Speech Synthesis
  return speakWithBrowserTTS(text, language);
}

function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Audio playback failed'));
    audio.play().catch(reject);
  });
}

function speakWithBrowserTTS(text: string, language: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(language);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error('Speech synthesis failed'));

    speechSynthesis.speak(utterance);
  });
}

function getLanguageCode(language: string): string {
  const map: Record<string, string> = {
    'English': 'en-US',
    'Hindi': 'hi-IN',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Japanese': 'ja-JP',
    'Chinese': 'zh-CN',
    'Korean': 'ko-KR',
    'Arabic': 'ar-SA',
    'Portuguese': 'pt-BR',
  };
  return map[language] || 'en-US';
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}
