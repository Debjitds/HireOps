// Browser Speech Recognition client
// Uses the Web Speech API (SpeechRecognition)

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

const SpeechRecognitionAPI =
  (window as unknown as Record<string, unknown>).SpeechRecognition ||
  (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

export function isSpeechSupported(): boolean {
  return !!SpeechRecognitionAPI;
}

export function createRecognition(language: string = 'en-US'): SpeechRecognitionInstance | null {
  if (!SpeechRecognitionAPI) return null;

  const recognition = new (SpeechRecognitionAPI as new () => SpeechRecognitionInstance)();
  recognition.lang = getLanguageCode(language);
  recognition.interimResults = true;
  recognition.continuous = true;

  return recognition;
}

// Map language names to BCP-47 codes
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
