import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Play, RotateCcw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SnitchState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  wingAngle: number;
}

export const SnitchGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('hogwarts_snitch_record') || 0);
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [caughtAnim, setCaughtAnim] = useState(false);

  const snitchRef = useRef<SnitchState>({
    x: 150,
    y: 120,
    vx: 3.5,
    vy: -2.8,
    radius: 14,
    wingAngle: 0
  });

  const animIdRef = useRef<number | null>(null);

  // Start game loop
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      snitchRef.current = {
        x: rect.width / 2,
        y: rect.height / 2,
        vx: (Math.random() - 0.5) * 8 + 3,
        vy: (Math.random() - 0.5) * 8 - 3,
        radius: 14,
        wingAngle: 0
      };
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 30]);
      } catch {}
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('hogwarts_snitch_record', String(score));
    }
  }, [score, highScore]);

  // Physics animation frame loop (60FPS locally, zero lag)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };
    updateSize();

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (isPlaying) {
        const s = snitchRef.current;

        // Apply erratic magical acceleration (Brownian erratic flutter)
        s.vx += (Math.random() - 0.5) * 1.8;
        s.vy += (Math.random() - 0.5) * 1.8;

        // Speed clamping
        const speed = Math.hypot(s.vx, s.vy);
        const maxSpeed = 7.5;
        if (speed > maxSpeed) {
          s.vx = (s.vx / speed) * maxSpeed;
          s.vy = (s.vy / speed) * maxSpeed;
        }

        s.x += s.vx;
        s.y += s.vy;
        s.wingAngle += 0.45;

        // Boundary rebound
        const pad = s.radius + 10;
        if (s.x < pad) {
          s.x = pad;
          s.vx = Math.abs(s.vx) * 1.05;
        } else if (s.x > rect.width - pad) {
          s.x = rect.width - pad;
          s.vx = -Math.abs(s.vx) * 1.05;
        }

        if (s.y < pad) {
          s.y = pad;
          s.vy = Math.abs(s.vy) * 1.05;
        } else if (s.y > rect.height - pad) {
          s.y = rect.height - pad;
          s.vy = -Math.abs(s.vy) * 1.05;
        }

        // Draw Snitch Glowing Trail
        ctx.beginPath();
        ctx.arc(s.x - s.vx * 1.5, s.y - s.vy * 1.5, s.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 229, 153, 0.25)';
        ctx.fill();

        // Draw Golden Wings
        const wingSpan = 22;
        const wingFlap = Math.sin(s.wingAngle) * 12;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.strokeStyle = 'rgba(255, 253, 245, 0.85)';
        ctx.fillStyle = 'rgba(255, 248, 220, 0.45)';
        ctx.lineWidth = 1.5;

        // Left wing
        ctx.beginPath();
        ctx.ellipse(-12, wingFlap, wingSpan, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right wing
        ctx.beginPath();
        ctx.ellipse(12, -wingFlap, wingSpan, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Golden Orb Body
        const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, s.radius);
        grad.addColorStop(0, '#FFFDF5');
        grad.addColorStop(0.3, '#FFE599');
        grad.addColorStop(0.7, '#D4AF37');
        grad.addColorStop(1, '#8C6718');

        ctx.beginPath();
        ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fill();

        // Inscribed Snitch Pattern line
        ctx.beginPath();
        ctx.arc(0, 0, s.radius * 0.65, 0.5, Math.PI * 1.5);
        ctx.strokeStyle = 'rgba(140, 29, 53, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isPlaying]);

  // Click/Touch intercept - Instant local resolution with zero latency
  const handleTouch = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isPlaying || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const s = snitchRef.current;
      const dist = Math.hypot(clickX - s.x, clickY - s.y);

      // Hitbox with touch generosity (radius + 24px)
      if (dist <= s.radius + 24) {
        setScore((prev) => prev + 150);
        setCaughtAnim(true);
        setTimeout(() => setCaughtAnim(false), 300);

        // Vibrate and particle
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([25, 40, 60]);
          } catch {}
        }

        confetti({
          particleCount: 20,
          spread: 50,
          origin: {
            x: (rect.left + s.x) / window.innerWidth,
            y: (rect.top + s.y) / window.innerHeight
          },
          colors: ['#FFE599', '#D4AF37', '#FFFDF5']
        });

        // Instant sudden evasive leap
        s.x = Math.random() * (rect.width - 60) + 30;
        s.y = Math.random() * (rect.height - 60) + 30;
        s.vx = (Math.random() - 0.5) * 12;
        s.vy = (Math.random() - 0.5) * 12;
      }
    },
    [isPlaying]
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-5 font-serif select-none">
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-4 sm:p-5 text-[#2C241E] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9C89E]/60 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/40 text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4 text-[#FFE599]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                  QUIDDITCH · 魁地奇
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#8C1D35] font-cinzel border border-[#D4AF37]/30">
                  60FPS ZERO LAG
                </span>
              </div>
              <h2 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                追逐金色飞贼 · 捕获心跳瞬间
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <div className="text-right">
              <span className="text-[9px] text-[#8C7658] font-cinzel block">RECORD</span>
              <span className="text-xs font-bold text-[#8C1D35]">{highScore}</span>
            </div>
          </div>
        </div>

        {/* Pitch Arena Container */}
        <div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#111A27] via-[#0D1522] to-[#080E18] border-2 border-[#D4AF37]/45 shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)] select-none"
          style={{ height: '240px', touchAction: 'none' }}
        >
          {/* Subtle Quidditch Pitch Ring markings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
            <div className="w-36 h-36 rounded-full border-2 border-[#FFE599]" />
            <div className="absolute w-20 h-20 rounded-full border border-[#FFE599]" />
          </div>

          {/* Canvas for 60FPS Snitch Flight */}
          <canvas
            ref={canvasRef}
            onPointerDown={handleTouch}
            className="w-full h-full block cursor-pointer"
            style={{ touchAction: 'none' }}
          />

          {/* Caught Flash Overlay */}
          {caughtAnim && (
            <div className="absolute inset-0 bg-[#FFE599]/20 pointer-events-none animate-pulse" />
          )}

          {/* In-game HUD */}
          {isPlaying && (
            <div className="absolute top-2 inset-x-3 flex justify-between items-center pointer-events-none z-20 font-cinzel text-xs text-[#FFFDF5]">
              <span className="bg-[#8C1D35]/80 px-2 py-0.5 rounded-full border border-[#D4AF37]/40 shadow-xs">
                SCORE: {score}
              </span>
              <span className="bg-[#182638]/80 px-2 py-0.5 rounded-full border border-[#D4AF37]/40 text-[#FFE599]">
                TIME: {timeLeft}S
              </span>
            </div>
          )}

          {/* Start Screen Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-[#0A101A]/85 flex flex-col items-center justify-center p-4 text-center z-30">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8C1D35] to-[#D4AF37] border-2 border-[#FFFDF5] flex items-center justify-center shadow-lg mb-2 text-xl"
              >
                ✨
              </motion.div>
              <h3 className="text-sm font-bold text-[#FFFDF5] font-cinzel tracking-wider">
                {score > 0 ? `比赛结束 · 斩获 ${score} 分` : '格兰芬多找球手就位'}
              </h3>
              <p className="text-[10px] text-[#C5A059] font-serif mt-0.5 mb-3">
                “飞贼在指尖盘旋，比谁能在 30 秒内抓到它最多次”
              </p>
              <button
                onClick={startGame}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA822A] text-[#1A140F] text-xs font-cinzel font-bold tracking-wider flex items-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer border border-[#FFFDF5]"
              >
                {score > 0 ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{score > 0 ? '再次启程对决' : '挥杖开赛 · START'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Score Pill */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#8C7658] font-cinzel">
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-[#D4AF37]" />
            GOLDEN SNITCH RECORD: {highScore} PTS
          </span>
          <span>150 PTS / CATCH</span>
        </div>
      </div>
    </div>
  );
};
