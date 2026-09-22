import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Clock, Feather, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BlurText } from '../animations/BlurText';
import { useCouple } from '../../context/CoupleContext';
import { appStorage } from '../../services/storage';

const SCRATCH_MESSAGES_POOL = [
  '“在漫长岁月中，你是我唯一的魔杖光芒 —— Always.”',
  '“浮世万千，唯有触碰你时，星光才悄然苏醒。”',
  '“世间所有魔法咒语，都不如你唤我名字时的温柔。”',
  '“金色的飞贼绕过天际，最终落进你盛满笑意的眼里。”',
  '“若思念有实体，早已在窗台叠起整座霍格沃茨书塔。”',
  '“把今天的第一缕阳光折进信笺，连同我所有的偏爱寄给你。”',
  '“在彼此心跳共振的频率里，风也变得格外清甜。”',
  '“愿所有的晦涩都随落日散去，留下的每一刻都是和你。”',
  '“岁月是一张未干的羊皮纸，每一行都想与你一笔一划书写。”',
  '“你是我在这个纷扰世界里，永远安稳的避风港湾。”',
  '“哪怕相隔千里，抬眸望见的是同一轮被爱意照亮的明月。”',
  '“爱不是奇迹的偶尔降临，而是你我相视一笑的每个日常。”'
];

function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDailyCipherForDate(dateKey: string): string {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % SCRATCH_MESSAGES_POOL.length;
  return SCRATCH_MESSAGES_POOL[idx];
}

export const ScratchCard: React.FC = () => {
  const { sendEvent, onEvent } = useCouple();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const todayKey = useMemo(() => getTodayDateKey(), []);
  const secretMessage = useMemo(() => getDailyCipherForDate(todayKey), [todayKey]);

  const [isScratched, setIsScratched] = useState(() => {
    const saved = appStorage.getScratchState(todayKey);
    return !!saved?.scratched;
  });
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Sync scratch to local storage
  const markScratchedToday = () => {
    setIsScratched(true);
    setTimeLeft(120);
    appStorage.setScratchState(todayKey, { scratched: true, revealedAt: Date.now() });
  };

  // Listen for partner revealing the card
  useEffect(() => {
    const unsub = onEvent('SCRATCH_REVEALED', () => {
      markScratchedToday();
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([20, 30, 40]);
        } catch {}
      }
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FFE599', '#D4AF37', '#8C1D35']
      });
    });
    return unsub;
  }, [onEvent, todayKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    if (isScratched) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Antique Gold Leaf Foil Texture
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#E5CE8E');
    gradient.addColorStop(0.35, '#C5A059');
    gradient.addColorStop(0.7, '#D4AF37');
    gradient.addColorStop(1, '#997D3A');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#423218';
    ctx.font = 'bold 10px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✧ APARECIUM · 荧光咒唤醒隐形金墨 ✧', canvas.width / 2, canvas.height / 2 + 3);
  }, [isScratched]);

  const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();

    // Requires genuine extensive scratching (at least 75% coverage with slow progression)
    if (scratchedPercent < 85) {
      setScratchedPercent((prev) => {
        // Very slow increment: requires at least 150~200 scratch moves across the card
        const next = prev + 0.45;
        if (next >= 78 && !isScratched) {
          markScratchedToday();
          // Clear remaining canvas completely with high satisfaction once threshold passed
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          sendEvent('SCRATCH_REVEALED', { timestamp: Date.now() });
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate([20, 30, 40]);
            } catch {}
          }
          confetti({
            particleCount: 25,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#FFE599', '#D4AF37', '#8C1D35']
          });
        }
        return next;
      });
    }
  };

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const isBurned = timeLeft === 0;

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 font-serif select-none">
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2] shadow-[0_12px_32px_-6px_rgba(45,30,15,0.08)] p-5 text-[#2C241E] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9C89E]/60 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/40 text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <Feather className="w-4 h-4 text-[#FFE599]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                  INVISIBLE INK · 隐形金墨
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#8C1D35] font-cinzel border border-[#D4AF37]/30">
                  DAILY CIPHER
                </span>
              </div>
              <h3 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                羊皮纸隐秘留白 · 指尖划拭现形
              </h3>
            </div>
          </div>

          {timeLeft !== null && !isBurned && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EADBC4]/70 text-[#8C1D35] border border-[#D9C89E] font-cinzel tracking-wider flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-[#8C1D35]" />
              {timeLeft}S REMAINING
            </span>
          )}
        </div>

        {/* Scratch Parchment Stage */}
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-[#FAF5EB] border border-[#D9C89E] flex items-center justify-center p-4 select-none shadow-inner">
          {isBurned ? (
            <div className="text-center text-[#A8987E] text-xs font-cinzel italic">
              ✦ 墨迹已被岁月风干隐没 · 明日午夜重现 ✦
            </div>
          ) : (
            <div className="text-center text-xs text-[#8C1D35] leading-relaxed px-3 font-serif font-bold italic">
              {isScratched ? (
                <BlurText text={secretMessage} delay={25} />
              ) : (
                <span className="opacity-0">{secretMessage}</span>
              )}
            </div>
          )}

          {!isBurned && (
            <canvas
              ref={canvasRef}
              onMouseMove={(e) => e.buttons === 1 && handleScratch(e)}
              onTouchMove={(e) => {
                e.preventDefault();
                handleScratch(e);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleScratch(e);
              }}
              className="absolute inset-0 w-full h-full cursor-pointer touch-none"
              style={{ touchAction: 'none' }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-[#D9C89E]/40 flex items-center justify-between text-[9px] text-[#8C7658] font-cinzel tracking-wider">
          <span className="flex items-center gap-1">
            <Wand2 className="w-3 h-3 text-[#D4AF37]" />
            ONLY REVEALED BY YOUR TOUCH
          </span>
          <span>MIDNIGHT REFRESH</span>
        </div>
      </div>
    </div>
  );
};
