import { useEffect, useRef, useState } from "react";

type SpeechRecognitionResultEvent = Event & {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionErrorEvent = Event & {
  error?: string;
};

type BrowserSpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

interface UseSpeechRecognitionOptions {
  enabled: boolean;
  language: string;
  onFinalTranscript: (text: string) => void;
  onError: (error: Error) => void;
}

function getRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions) {
  const [isSupported] = useState(() => Boolean(getRecognitionConstructor()));
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);
  const restartTimeoutRef = useRef<number | null>(null);
  const onFinalTranscriptRef = useRef(options.onFinalTranscript);
  const onErrorRef = useRef(options.onError);

  useEffect(() => {
    onFinalTranscriptRef.current = options.onFinalTranscript;
    onErrorRef.current = options.onError;
  }, [options.onError, options.onFinalTranscript]);

  useEffect(() => {
    const RecognitionConstructor = getRecognitionConstructor();

    if (!RecognitionConstructor) {
      return undefined;
    }

    const recognition = new RecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = options.language;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result?.isFinal) {
          const transcript = result[0]?.transcript.trim();
          if (transcript) {
            onFinalTranscriptRef.current(transcript);
          }
        }
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      onErrorRef.current(new Error(event.error ?? "Speech recognition error"));
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (shouldListenRef.current) {
        restartTimeoutRef.current = window.setTimeout(() => {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        }, 350);
      }
    };

    return () => {
      shouldListenRef.current = false;
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [options.language]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return undefined;
    }

    shouldListenRef.current = options.enabled;
    if (options.enabled) {
      try {
        recognition.start();
      } catch {
        // Browsers throw if recognition is already running; the event callbacks keep state in sync.
      }
    } else {
      recognition.stop();
    }

    return undefined;
  }, [options.enabled]);

  return { isListening, isSupported };
}
