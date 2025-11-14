"use client";
import React, { useEffect, useRef, useState } from "react";

// Simple demo playlist - replace these URLs with your real audio file URLs
const PLAYLIST = [
  {
    title: "ARMS LENGTH v1",
    url: "/audio/ARMS LENGTH v1.mp3",
  },
  {
    title: "smth wrong w me 150bpm Fmin (cohen loops)",
    url: "/audio/smth wrong w me 150bpm Fmin (cohen loops).mp3",
  },
  {
    title: "HOLD ME CLOSE new hook idea",
    url: "/audio/HOLD ME CLOSE new hook idea.mp3",
  },
  {
    title: "never never let let go (dnb)",
    url: "/audio/never never let let go (dnb).mp3",
  },
];

export default function ReykoFM() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTunedIn, setIsTunedIn] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isIOS, setIsIOS] = useState(false);

  // detect iOS so we can hide the fake volume slider there
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setIsIOS(true);
    }
  }, []);

  // Handle autoplay after user interaction (required by browsers)
  const handleTuneIn = () => {
    setIsTunedIn(true);
  };

  // When tuned in or track index changes, update audio source and play
  useEffect(() => {
    if (!isTunedIn) return;
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.src = PLAYLIST[currentIndex].url;
    audio.volume = volume;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.error("Autoplay blocked:", err);
      }
    };

    playAudio();
  }, [isTunedIn, currentIndex]);

  // Update volume when slider changes (works on desktop)
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  // On track end, move to next track (looping)
  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  // Optional: randomize start track on first mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * PLAYLIST.length);
    setCurrentIndex(randomIndex);
  }, []);

  const currentTrack = PLAYLIST[currentIndex];

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 flex items-center justify-center p-4">
      <audio ref={audioRef} onEnded={handleEnded} preload="auto" />

      <div className="w-full max-w-xl bg-zinc-900/70 border border-zinc-800 rounded-2xl shadow-xl p-6 flex flex-col gap-6">
        {/* Header / Logo */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-lime-400/70 flex items-center justify-center text-xs tracking-[0.2em] uppercase">
              FM
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                REYKO-FM
              </div>
              <div className="text-xs text-zinc-500">
                A 24/7 stream of unreleased REYKO! demos.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-lime-400">
            <span className="inline-flex h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
            Live
          </div>
        </div>

        {/* Main content */}
        {!isTunedIn ? (
          <button
            onClick={handleTuneIn}
            className="w-full py-4 rounded-xl bg-lime-400 text-black text-sm font-medium tracking-wide uppercase hover:bg-lime-300 transition-colors"
          >
            Tune In to REYKO-FM
          </button>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Fake waveform / visual */}
            <div className="h-24 w-full rounded-xl bg-zinc-800 overflow-hidden flex gap-[2px]">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-lime-400/80 origin-bottom animate-pulse"
                  style={{
                    animationDelay: `${(i % 8) * 0.12}s`,
                    animationDuration: `${0.9 + (i % 5) * 0.1}s`,
                  }}
                />
              ))}
            </div>

            {/* Now playing */}
            <div className="flex flex-col gap-1">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Now Playing
              </div>
              <div className="text-lg font-medium truncate">
                {currentTrack.title}
              </div>
              <div className="text-xs text-zinc-500">
                Unreleased demo • Personal archive
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-xs text-zinc-500">
                <span className="uppercase tracking-[0.2em] text-[10px]">
                  Controls
                </span>
                <span>No pause, no skip. Just listen.</span>
              </div>

              {isIOS ? (
                <div className="flex flex-col items-end text-[10px] text-zinc-500 gap-1">
                  <span className="uppercase tracking-[0.2em]">Volume</span>
                  <span className="text-[10px]">
                    Use your iPhone volume buttons 🎧
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-[160px]">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    Volume
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-800 mt-2 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
          <span>Unreleased discography loop</span>
          <span>REYKO! © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
