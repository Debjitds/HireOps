import { useState, useRef, useCallback } from 'react';
import { createRecognition, isSpeechSupported } from '@/lib/speechClient';

interface UseSpeechOptions {
  language?: string;
}

export function useSpeech({ language = 'English' }: UseSpeechOptions = {}) {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ReturnType<typeof createRecognition>>(null);
  const supported = isSpeechSupported();

  const start = useCallback(() => {
    if (!supported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    setError(null);
    setInterimTranscript('');

    const recognition = createRecognition(language);
    if (!recognition) return;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript(prev => prev + (prev ? ' ' : '') + final.trim());
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, supported]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript('');
  }, []);

  const reset = useCallback(() => {
    stop();
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, [stop]);

  return {
    transcript,
    interimTranscript,
    isRecording,
    error,
    supported,
    start,
    stop,
    reset,
    setTranscript,
  };
}
