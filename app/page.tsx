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

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  top: `${(i * 37) % 100}%`,
  left: `${(i * 53) % 100}%`,
  delay: `${(i % 6) * 0.7}s`,
}));

export default function ReykoFM() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTunedIn, setIsTunedIn] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);

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

  // Update volume when slider changes
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
    <div className="min-h-screen w-full bg-black text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-lime-500/10 blur-3xl" />
      </div>

      {/* Drifting particles */}
      <div className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-lime-400/35 animate-pulse"
            style={{
              top: p.top,
              left: p.left,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <audio ref={audioRef} onEnded={handleEnded} preload="auto" />

      <div className="relative w-full max-w-xl bg-zinc-900/70 border border-zinc-800/80 rounded-2xl shadow-[0_0_50px_rgba(22,163,74,0.35)] p-6 flex flex-col gap-6 backdrop-blur-sm">
        {/* subtle inner glow border */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-lime-400/10" />

        {/* Header / Logo */}
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full border border-lime-400/70 flex items-center justify-center text-xs tracking-[0.2em] uppercase bg-black/60 shadow-[0_0_25px_rgba(190,242,100,0.45)]"
              style={{ animation: "spin 18s linear infinite" }} // slow rotate
            >
              FM
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.25em] text-zinc-300">
                REYKO-FM
              </div>
              <div className="text-xs text-zinc-500">
                A 24/7 stream of unreleased REYKO! demos.
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-lime-400"
            style={{ textShadow: "0 0 12px rgba(190,242,100,0.85)" }}
          >
            <span className="inline-flex h-2 w-2 rounded-full bg-lime-400 animate-pulse shadow-[0_0_15px_rgba(190,242,100,0.9)]" />
            Live
          </div>
        </div>

        {/* Main content */}
        {!isTunedIn ? (
          <button
            onClick={handleTuneIn}
            className="w-full py-4 rounded-xl bg-lime-400 text-black text-sm font-medium tracking-wide uppercase hover:bg-lime-300 transition-colors shadow-[0_0_35px_rgba(190,242,100,0.65)]"
          >
            Tune In to REYKO-FM
          </button>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Fake waveform / visual */}
            <div className="h-24 w-full rounded-xl bg-zinc-900/80 overflow-hidden flex gap-[2px] border border-zinc-800/80">
              {Array.from({ length: 64 }).map((_, i) => {
                const scale = 0.4 + (i % 5) * 0.18;
                const delay = (i % 8) * 0.12;
                const duration = 1 + (i % 4) * 0.15;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-lime-400/80 origin-bottom animate-pulse"
                    style={{
                      transform: `scaleY(${scale})`,
                      animationDelay: `${delay}s`,
                      animationDuration: `${duration}s`,
                      boxShadow: "0 0 16px rgba(190,242,100,0.45)",
                    }}
                  />
                );
              })}
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
              <div className="flex flex-col gap-1 text-xs text-zinc-500 max-w-[55%]">
                <span className="uppercase tracking-[0.2em] text-[10px]">
                  Controls
                </span>
                <span>No pause, no skip. Just tune in and let it run.</span>
              </div>

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
                  className="w-full accent-lime-400"
                />
              </div>
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
