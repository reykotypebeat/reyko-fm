"use client";
import React, { useEffect, useRef, useState } from "react";

// Playlist with raw filenames, URLs are built safely in code
const PLAYLIST = [
  {
    title: "4 U (final master 20/02/25)",
    file: "four_u.wav",
  },
  {
    title: "ARMS LENGTH v1",
    file: "ARMS LENGTH v1.mp3",
  },
  {
    title: "around 4 ya [lofi house]",
    file: "around 4 ya [lofi house].mp3",
  },
  {
    title: "atmospheric brain tingles V1",
    file: "atmospheric brain tingles V1.mp3",
  },
  {
    title: "blood stained gums demo",
    file: "blood stained gums demo.mp3",
  },
  {
    title: "blurred days blur always V2",
    file: "blurred days blur always V2.mp3",
  },
  {
    title: "bone marrow v1",
    file: "bone marrow v1.mp3",
  },
  {
    title: "caught them flowers (v1)",
    file: "caught them flowers (v1).mp3",
  },
  {
    title: "choose [nolonger]",
    file: "choose [nolonger].mp3",
  },
  {
    title: "companionship",
    file: "companionship.mp3",
  },
  {
    title: "don't forget abt me v1",
    file: "don't forget abt me v1.mp3",
  },
  {
    title: "everywhere i go (72bpm bmin instrumental)",
    file: "everywhere i go (72bpm bmin instrumental).mp3",
  },
  {
    title: "fragility (piano composition)",
    file: "fragility (piano composition).mp3",
  },
  {
    title: "HOLD ME CLOSE new hook idea",
    file: "HOLD ME CLOSE new hook idea.mp3",
  },
  {
    title: "home (final)",
    file: "home (final).wav",
  },
  {
    title: "I WANT U v1",
    file: "I WANT U v1.mp3",
  },
  {
    title: "jazz beat???",
    file: "jazz beat???.mp3",
  },
  {
    title: "keep playin me V1",
    file: "keep playin me V1.mp3",
  },
  {
    title: "life i was given",
    file: "life i was given.mp3",
  },
  {
    title: "middlemist v1",
    file: "middlemist v1.mp3",
  },
  {
    title: "momentary [nolonger]",
    file: "momentary [nolonger].mp3",
  },
  {
    title: "MY PEACE – V2",
    file: "MY PEACE – V2.wav",
  },
  {
    title: "my peace sidechain hyperpop remix",
    file: "my peace sidechain hyperpop remix.mp3",
  },
  {
    title: "never never let let go (dnb)",
    file: "never never let let go (dnb).mp3",
  },
  {
    title: "nolonger [beginning] FADE IN",
    file: "nolonger [beginning] FADE IN.mp3",
  },
  {
    title: "nolonger [middle] FADE IN",
    file: "nolonger [middle] FADE IN.mp3",
  },
  {
    title: "nothing comes free",
    file: "nothing comes free.mp3",
  },
  {
    title: "reyko zimmer atmos V1",
    file: "reyko zimmer atmos V1.mp3",
  },
  {
    title: "should've seen that coming",
    file: "should've seen that coming.mp3",
  },
  {
    title: "simple man",
    file: "simple man.mp3",
  },
  {
    title: "smth wrong w me 150bpm Fmin (cohen loops)",
    file: "smth wrong w me 150bpm Fmin (cohen loops).mp3",
  },
  {
    title: "some1 OG pitch",
    file: "some1 OG pitch.mp3",
  },
  {
    title: "starlight",
    file: "starlight.wav",
  },
  {
    title: "SYRUP 114bpm Ebmin v2",
    file: "SYRUP 114bpm Ebmin v2.mp3",
  },
  {
    title: "TOXIC (YNG X REYKO) v4",
    file: "TOXIC (YNG X REYKO) v4.mp3",
  },
  {
    title: "viced",
    file: "viced.mp3",
  },
  {
    title: "wake up (final)",
    file: "wake up (final).wav",
  },
  {
    title: "WATER V2",
    file: "WATER V2.mp3",
  },
  {
    title: "when the world stops spinning (final)",
    file: "when the world stops spinning (final).wav",
  },
  {
    title: "won't let u down [nolonger] v2",
    file: "won't let u down [nolonger] v2.wav",
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
  const [isIOS, setIsIOS] = useState<boolean>(false);

  // For audio-reactive waveform
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const barRefs = useRef<HTMLDivElement[]>([]);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);

  // For true shuffle (no repeats until all tracks played)
  const shuffledPlaylistRef = useRef<number[]>([]);
  const playedTracksRef = useRef<Set<number>>(new Set());

  // Detect iOS on mount
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
  }, []);

  const setupAudioContext = () => {
    if (typeof window === "undefined") return;
    if (!audioRef.current) return;
    if (audioContextRef.current) return;

    console.log('[DEBUG] Setting up AudioContext:', { isIOS });

    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();

    console.log('[DEBUG] AudioContext created:', {
      state: ctx.state,
      sampleRate: ctx.sampleRate
    });

    const src = ctx.createMediaElementSource(audioRef.current);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;

    if (isIOS) {
      // iOS: Only connect to analyser for visualization, NOT to destination
      // This allows native <audio> playback to continue in background
      src.connect(analyser);
      console.log('[DEBUG] iOS: Connected source to analyser only (NO destination)');
      // DO NOT connect analyser to destination on iOS
    } else {
      // Desktop: Full Web Audio chain with audio output
      src.connect(analyser);
      analyser.connect(ctx.destination);
      console.log('[DEBUG] Desktop: Connected source -> analyser -> destination');
    }

    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    sourceNodeRef.current = src;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!analyserRef.current) return;

      // On iOS, only update visualizer when page is visible
      if (isIOS && !isPageVisible) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      analyserRef.current.getByteFrequencyData(dataArray);

      const bars = barRefs.current;
      const barCount = bars.length;
      if (barCount === 0) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      const step = Math.max(1, Math.floor(bufferLength / barCount));

      // Find max value this frame
      let frameMax = 0;
      const values: number[] = [];

      for (let i = 0; i < barCount; i++) {
        const idx = i * step;
        const raw = dataArray[idx] ?? 0;
        values[i] = raw;
        if (raw > frameMax) frameMax = raw;
      }

      // Raise ceiling so it never bricks visually
      let frameMaxAdjusted = frameMax * 1.6;
      if (frameMaxAdjusted < 1) frameMaxAdjusted = 1;

      for (let i = 0; i < barCount; i++) {
        const bar = bars[i];
        if (!bar) continue;

        const rawNorm = values[i] / frameMaxAdjusted;
        const norm = Math.min(rawNorm, 1);
        const shaped = Math.pow(norm, 1.1);

        const scale = 0.2 + shaped * 0.9;
        bar.style.transform = `scaleY(${scale})`;
        bar.style.opacity = (0.25 + shaped * 0.7).toString();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    ctx
      .resume()
      .then(() => {
        console.log('[DEBUG] AudioContext resumed successfully:', ctx.state);
      })
      .catch((err) => {
        console.error('[DEBUG] AudioContext resume failed:', err);
      })
      .finally(() => {
        render();
      });
  };

  // Fisher-Yates shuffle algorithm
  const shufflePlaylist = () => {
    const indices = Array.from({ length: PLAYLIST.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  };

  const getNextTrackIndex = () => {
    // Initialize shuffle on first call
    if (shuffledPlaylistRef.current.length === 0) {
      shuffledPlaylistRef.current = shufflePlaylist();
    }

    // Find next unplayed track
    const nextTrack = shuffledPlaylistRef.current.find(
      (idx) => !playedTracksRef.current.has(idx)
    );

    if (nextTrack !== undefined) {
      playedTracksRef.current.add(nextTrack);
      return nextTrack;
    }

    // All tracks played - reshuffle and start over
    playedTracksRef.current.clear();
    shuffledPlaylistRef.current = shufflePlaylist();
    const firstTrack = shuffledPlaylistRef.current[0];
    playedTracksRef.current.add(firstTrack);
    return firstTrack;
  };

  const handleTuneIn = () => {
    setIsTunedIn(true);
    setupAudioContext();
  };

  // Load & play track when tuned in or index changes
  useEffect(() => {
    if (!isTunedIn) return;
    if (!audioRef.current) return;

    const track = PLAYLIST[currentIndex];
    const audio = audioRef.current;

    // Build a safe URL from the raw filename
    const encoded = encodeURIComponent(track.file);
    audio.src = `/audio/${encoded}`;

    const playAudio = async () => {
      try {
        console.log('[DEBUG] Attempting to play audio:', {
          src: audio.src,
          paused: audio.paused,
          readyState: audio.readyState,
          isIOS,
          hasAudioContext: !!audioContextRef.current,
          audioContextState: audioContextRef.current?.state
        });
        
        await audio.play();
        
        console.log('[DEBUG] Audio play() succeeded:', {
          paused: audio.paused,
          currentTime: audio.currentTime,
          volume: audio.volume,
          muted: audio.muted
        });
      } catch (err) {
        console.error("[DEBUG] Autoplay blocked or failed:", err);
      }
    };

    playAudio();
  }, [isTunedIn, currentIndex]);

  // Volume control via HTMLAudioElement (desktop only, iOS uses hardware buttons)
  useEffect(() => {
    if (!audioRef.current) return;
    if (isIOS) return; // iOS blocks programmatic volume control
    audioRef.current.volume = volume;
  }, [volume, isIOS]);

  const handleEnded = () => {
    const nextIndex = getNextTrackIndex();
    setCurrentIndex(nextIndex);
  };

  // Initialize with random track from shuffled playlist
  useEffect(() => {
    const firstIndex = getNextTrackIndex();
    setCurrentIndex(firstIndex);
  }, []);

  // Track page visibility for iOS visualizer
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      setIsPageVisible(visible);

      // Resume AudioContext when page becomes visible
      if (visible && audioContextRef.current) {
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume().catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
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
            className="particle-dot h-1 w-1 rounded-full bg-lime-400/40"
            style={{
              top: p.top,
              left: p.left,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <audio
        ref={audioRef}
        onEnded={handleEnded}
        preload="auto"
        onLoadedMetadata={() => console.log('[DEBUG] Audio metadata loaded')}
        onCanPlay={() => console.log('[DEBUG] Audio can play')}
        onPlay={() => console.log('[DEBUG] Audio play event fired')}
        onPause={() => console.log('[DEBUG] Audio pause event fired')}
        onError={(e) => console.error('[DEBUG] Audio error:', e)}
      />

      <div className="relative w-full max-w-xl bg-zinc-900/70 border border-zinc-800/80 rounded-2xl shadow-[0_0_50px_rgba(22,163,74,0.35)] p-6 flex flex-col gap-6 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-lime-400/10" />

        {/* Header */}
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-lime-400/70 flex items-center justify-center text-xs tracking-[0.2em] uppercase bg-black/60 shadow-[0_0_25px_rgba(190,242,100,0.45)]">
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

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-lime-400 live-glow">
            <span className="inline-flex h-2 w-2 rounded-full bg-lime-400 animate-pulse live-dot" />
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
            {/* Waveform */}
            <div className="h-24 w-full rounded-xl bg-zinc-900/80 overflow-hidden flex gap-[2px] border border-zinc-800/80">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    if (el) barRefs.current[i] = el;
                  }}
                  className="flex-1 bg-lime-400/80 origin-bottom waveform-bar"
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

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-xs text-zinc-500 max-w-[55%]">
                <span className="uppercase tracking-[0.2em] text-[10px]">
                  Controls
                </span>
                <span>No pause, no skip. Just tune in and let it run.</span>
              </div>

              {!isIOS && (
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