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

// Detect iOS devices
const isIOS = () => {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export default function ReykoFM() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTunedIn, setIsTunedIn] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isIOSDevice, setIsIOSDevice] = useState<boolean>(false);

  // For desktop-only Web Audio volume control + analyser
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // For true shuffle (no repeats until all tracks played)
  const shuffledPlaylistRef = useRef<number[]>([]);
  const playedTracksRef = useRef<Set<number>>(new Set());

  // Detect iOS on mount
  useEffect(() => {
    setIsIOSDevice(isIOS());
  }, []);

  const setupAudioContext = () => {
    if (typeof window === "undefined") return;
    if (!audioRef.current) return;
    if (audioContextRef.current) return;
    if (isIOSDevice) return; // Skip Web Audio on iOS

    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();

    const src = ctx.createMediaElementSource(audioRef.current);
    const gainNode = ctx.createGain();
    const analyser = ctx.createAnalyser();

    // Configure analyser for waveform visualization
    analyser.fftSize = 64; // Small FFT for 32 frequency bins
    analyser.smoothingTimeConstant = 0.8;

    // Audio chain: audio -> source -> analyser -> gain -> destination
    src.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Set initial volume via GainNode
    gainNode.gain.value = volume;

    audioContextRef.current = ctx;
    gainNodeRef.current = gainNode;
    analyserRef.current = analyser;

    ctx.resume().catch(() => {});
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
    if (!isIOSDevice) {
      setupAudioContext();
    }
  };

  // Setup Media Session API for iOS background playback
  const setupMediaSession = (track: typeof PLAYLIST[0]) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: 'REYKO!',
        album: 'Unreleased Demos',
        artwork: [
          { src: '/og-reyko-fm.png', sizes: '1200x630', type: 'image/png' },
        ],
      });

      // Set up action handlers (even though we don't allow skip/pause, iOS requires them)
      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        // We don't allow pause, but iOS requires this handler
        audioRef.current?.pause();
      });

      // Disable skip actions since we don't allow them
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    }
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

    // Setup Media Session API for this track
    setupMediaSession(track);

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.error("Autoplay blocked:", err);
      }
    };

    playAudio();
  }, [isTunedIn, currentIndex]);

  // Volume control via GainNode (desktop only) or HTMLAudioElement (iOS)
  useEffect(() => {
    if (isIOSDevice && audioRef.current) {
      // On iOS, use native audio element volume
      audioRef.current.volume = volume;
    } else if (gainNodeRef.current) {
      // On desktop, use GainNode
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume, isIOSDevice]);

  const handleEnded = () => {
    const nextIndex = getNextTrackIndex();
    setCurrentIndex(nextIndex);
  };

  // Initialize with random track from shuffled playlist
  useEffect(() => {
    const firstIndex = getNextTrackIndex();
    setCurrentIndex(firstIndex);
  }, []);

  // Desktop: resume AudioContext when page becomes visible
  useEffect(() => {
    if (isIOSDevice) return;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        audioContextRef.current &&
        audioContextRef.current.state === "suspended"
      ) {
        audioContextRef.current.resume().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isIOSDevice]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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

      <audio ref={audioRef} onEnded={handleEnded} preload="auto" />

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
            {/* Audio visualizer - reactive on desktop, static on iOS */}
            {isIOSDevice ? (
              <div className="h-24 w-full rounded-xl bg-zinc-900/80 border border-zinc-800/80 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-400/20 via-lime-400/40 to-lime-400/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-1 w-[85%] bg-lime-400/90 rounded-full shadow-[0_0_20px_rgba(190,242,100,0.8)]" />
                </div>
              </div>
            ) : (
              <AudioVisualizer analyserRef={analyserRef} isTunedIn={isTunedIn} />
            )}

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

              {isIOSDevice ? (
                <div className="flex items-center gap-2 text-xs text-zinc-500 italic">
                  Use device volume on iPhone
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

// Desktop-only audio-reactive visualizer component
function AudioVisualizer({
  analyserRef,
  isTunedIn,
}: {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isTunedIn: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedHeightsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isTunedIn || !analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 32;

    // Initialize smoothed heights array
    if (smoothedHeightsRef.current.length === 0) {
      smoothedHeightsRef.current = new Array(barCount).fill(0);
    }

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = "rgb(24, 24, 27)"; // zinc-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "rgba(190, 242, 100, 0.2)");
      gradient.addColorStop(0.5, "rgba(190, 242, 100, 0.4)");
      gradient.addColorStop(1, "rgba(190, 242, 100, 0.2)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars with soft scaling and smoothing
      const barWidth = canvas.width / barCount;
      const barGap = 2;
      const maxHeightPercent = 0.65; // Ceiling clamp - never reach more than 65% height
      const lerpFactor = 0.15; // Smoothing factor for bar transitions

      for (let i = 0; i < barCount; i++) {
        // Normalize to 0-1 range
        const normalized = dataArray[i] / 255;
        
        // Apply soft power curve for dynamic range compression (avoid brickwall)
        const curved = Math.pow(normalized, 0.7);
        
        // Apply ceiling clamp
        const clamped = Math.min(curved, maxHeightPercent);
        
        // Calculate target height
        const targetHeight = clamped * canvas.height;
        
        // Smooth transition using linear interpolation (lerp)
        const currentHeight = smoothedHeightsRef.current[i];
        const smoothedHeight = currentHeight + (targetHeight - currentHeight) * lerpFactor;
        smoothedHeightsRef.current[i] = smoothedHeight;

        const x = i * barWidth;
        const y = canvas.height - smoothedHeight;

        // Create glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(190, 242, 100, 0.8)";
        ctx.fillStyle = "rgb(190, 242, 100)";
        ctx.fillRect(x + barGap / 2, y, barWidth - barGap, smoothedHeight);
      }

      // Reset shadow for next frame
      ctx.shadowBlur = 0;
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserRef, isTunedIn]);

  return (
    <div className="h-24 w-full rounded-xl bg-zinc-900/80 border border-zinc-800/80 overflow-hidden relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={96}
        className="w-full h-full"
      />
    </div>
  );
}