import { useCallback, useEffect, useRef, useState } from "react";

export function useVoiceCapture() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSupported(Boolean(Ctor));
  }, []);

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setError("A böngésződ nem támogatja a hangfelismerést.");
      return;
    }
    setError(null);
    setTranscript("");

    const recognition = new Ctor();
    recognition.lang = "hu-HU";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i][0].transcript;
      }
      setTranscript(combined);
    };
    recognition.onerror = (event) => {
      setError(`Hiba történt a hangfelismerés során (${event.error}).`);
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { supported, listening, transcript, error, start, stop, reset };
}
