"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  return english.find((v) => /google|natural|samantha|zira|david/i.test(v.name))
    ?? english[0]
    ?? voices[0];
}

export function useAvatarSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", update);
    };
  }, [supported]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const selectedVoice = useMemo(() => pickVoice(voices), [voices]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) {
        setError("Text-to-speech is not supported on this browser.");
        return;
      }
      const trimmed = text.trim();
      if (!trimmed) return;

      setError(null);
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 1.06;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => {
        setSpeaking(false);
        setError("Unable to play avatar voice.");
      };
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, supported]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return {
    supported,
    speaking,
    error,
    speak,
    stop,
  };
}
