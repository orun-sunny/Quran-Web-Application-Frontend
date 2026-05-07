"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

interface AudioContextType {
  isPlaying: boolean;
  currentVerseId: number | null;
  currentSurahId: number | null;
  error: string | null;
  audioError: string | null;
  playVerse: (surahId: number, startVerseId: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reciter: string;
  setReciter: (value: string) => void;
  reciters: Array<{ id: string; label: string }>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTime: number;
  totalDuration: number;
  elapsedTime: number;
  currentIndex: number;
  audioUrls: string[];
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const API_BASE =
    process.env.NEXT_PUBLIC_QURAN_API_BASE ?? "http://localhost:5001";
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentSurahId, setCurrentSurahId] = useState<number | null>(null);
  const [reciter, setReciter] = useState<string>("ar.alafasy");
  const [reciters, setReciters] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [startVerse, setStartVerse] = useState<number | null>(null);
  const [durations, setDurations] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentVerseId =
    currentIndex >= 0 && startVerse !== null ? startVerse + currentIndex : null;

  useEffect(() => {
    const saved = localStorage.getItem("quranAudioReciter");
    if (saved) {
      setReciter(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("quranAudioReciter", reciter);
  }, [reciter]);

  useEffect(() => {
    let isCancelled = false;

    const loadReciters = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/audio/reciters`);
        const data = await response.json();
        if (!response.ok || isCancelled) return;

        const options = Array.isArray(data?.reciters) ? data.reciters : [];
        setReciters(options);

        const fallback = data?.defaultReciter;
        if (!localStorage.getItem("quranAudioReciter") && fallback) {
          setReciter(fallback);
        }
      } catch {
        // Keep defaults silently
      }
    };

    loadReciters();
    return () => {
      isCancelled = true;
    };
  }, [API_BASE]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= audioUrls.length) {
          setIsPlaying(false);
          return prev;
        }
        return nextIndex;
      });
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleError = () => {
      setAudioError("Audio failed to load. Try another reciter or verse.");
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("error", handleError);
    };
  }, [audioUrls.length]);

  useEffect(() => {
    if (audioUrls.length === 0) {
      setDurations([]);
      return;
    }

    let isCancelled = false;
    const fetchDurations = async () => {
      const newDurations = new Array(audioUrls.length).fill(0);

      const promises = audioUrls.map((url, index) => {
        return new Promise<void>((resolve) => {
          const audio = new window.Audio(url);
          audio.preload = "metadata";
          audio.onloadedmetadata = () => {
            newDurations[index] = audio.duration;
            resolve();
          };
          audio.onerror = () => resolve();
        });
      });

      await Promise.all(promises);
      if (!isCancelled) {
        setDurations(newDurations);
      }
    };

    fetchDurations();
    return () => {
      isCancelled = true;
    };
  }, [audioUrls]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0 || currentIndex >= audioUrls.length) return;

    audio.src = audioUrls[currentIndex];
    audio.currentTime = 0;
    audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, [audioUrls, currentIndex]);

  const playVerse = async (surahId: number, startVerseId: number) => {
    setError(null);
    setAudioError(null);
    setIsPlaying(false);
    setAudioUrls([]);
    setCurrentIndex(-1);
    setStartVerse(startVerseId);
    setCurrentSurahId(surahId);

    try {
      const response = await fetch(
        `${API_BASE}/api/audio/surah/${surahId}?from=1&reciter=${encodeURIComponent(
          reciter,
        )}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Failed to load audio.");
        return;
      }

      const urls = Array.isArray(data?.audioUrls) ? data.audioUrls : [];
      if (urls.length === 0) {
        setError("No audio URLs returned.");
        return;
      }

      setAudioUrls(urls);
      setCurrentIndex(Math.max(0, startVerseId - 1));
    } catch {
      setError("Failed to load audio.");
    }
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const resume = () => {
    if (audioUrls.length > 0 && currentIndex >= 0) {
      audioRef.current?.play();
    }
  };

  const stop = () => {
    setIsPlaying(false);
    audioRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setAudioUrls([]);
    setCurrentIndex(-1);
    setCurrentTime(0);
    setDurations([]);
    setStartVerse(null);
    setCurrentSurahId(null);
  };

  const totalDuration = durations.reduce((a, b) => a + b, 0);
  const elapsedTime =
    durations.slice(0, Math.max(0, currentIndex)).reduce((a, b) => a + b, 0) +
    currentTime;

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentVerseId,
        currentSurahId,
        error,
        audioError,
        playVerse,
        pause,
        resume,
        stop,
        reciter,
        setReciter,
        reciters,
        audioRef,
        currentTime,
        totalDuration,
        elapsedTime,
        currentIndex,
        audioUrls,
      }}
    >
      {children}
      <audio ref={audioRef} preload="auto" />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
