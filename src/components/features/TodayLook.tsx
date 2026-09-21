import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FloatingSticker {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export const TodayLook: React.FC = () => {
  const [myPhoto, setMyPhoto] = useState<string | null>(null);
  const [partnerPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85'
  );
  const [stickers, setStickers] = useState<FloatingSticker[]>([]);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null);

  // Erised Latin Inscription
  // "Erised stra ehru oyt ube cafru oyt on wohsi" (I show not your face but your heart's desire)
  const ERISED_LATIN = "· ERISED STRA EHRU OYT UBE CAFRU OYT ON WOHSI ·";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMyPhoto(event.target?.result as string);
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.4 },
          colors: ['#D4AF37', '#FFF2CE', '#AA822A', '#8C1D35']
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSticker = (emoji: string) => {
    const newSticker: FloatingSticker = {
      id: Date.now(),
      emoji,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40
    };
    setStickers((prev) => [...prev, newSticker]);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 20]);
      } catch {}
    }
  };

  // Draw silver mercury frost mist on partner's mirror when not unlocked
  useEffect(() => {
    const canvas = mirrorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.parentElement?.clientWidth || 180;
    const h = canvas.parentElement?.clientHeight || 240;
    canvas.width = w;
    canvas.height = h;

    // Rich mercurial enchanted silver frost gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1A2433');
    grad.addColorStop(0.35, '#2D3A4E');
    grad.addColorStop(0.7, '#1E293B');
    grad.addColorStop(1, '#0F172A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle runic gold speckles
    ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }

    // Calligraphic Inscription on Frost
    ctx.fillStyle = '#FFE599';
    ctx.font = 'bold 9px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✧ APARECIUM · 急急现形 ✧', w / 2, h / 2 - 8);
    ctx.fillStyle = '#C5A059';
    ctx.font = '8px serif';
    ctx.fillText('指尖轻抚 · 拭去水银镜雾', w / 2, h / 2 + 10);
  }, [myPhoto]);

  // Touch/Mouse wiping ceremony
  const handleWipe = (e: React.MouseEvent | React.TouchEvent) => {
    if (isFullyRevealed) return;
    const canvas = mirrorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    // Trigger complete reveal after enough touch swipes
    if (!isFullyRevealed) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([15]);
        } catch {}
      }
      setIsFullyRevealed(true);
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.45 },
        colors: ['#FFE599', '#D4AF37', '#FFF2CE', '#8C1D35']
      });
    }
  };

  const isUnlocked = Boolean(myPhoto) || isFullyRevealed;

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 font-serif select-none space-y-4">
      {/* ========================================================
          1. ERISED MIRROR CONTAINER (厄里斯魔镜主殿堂卡片)
      ======================================================== */}
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#0A111C] shadow-[0_20px_50px_-10px_rgba(2,6,12,0.95)] p-5 text-[#F5EBD9] overflow-hidden">
        
        {/* Ancient Mirror Gothic Arch Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D4AF37]/25 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#142032] border border-[#D4AF37]/50 text-[#F5E8BE] flex items-center justify-center shadow-md">
              <Camera className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#C5A059] block leading-none">
                  MIRROR OF ERISED · 厄里斯魔镜
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#FFE599] font-cinzel border border-[#D4AF37]/30">
                  DAILY LOOK
                </span>
              </div>
              <h2 className="text-xs font-bold text-[#F5EBD9] font-serif mt-0.5">
                双生画像入镜 · 照见内心所愿
              </h2>
            </div>
          </div>

          <span className="text-[8.5px] font-cinzel text-[#8C7658] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">
            ANNO 1897
          </span>
        </div>

        {/* ========================================================
            2. DUAL BAROQUE GILDED PICTURE FRAMES (巴洛克重金雕花镜框)
        ======================================================== */}
        <div className="grid grid-cols-2 gap-3.5 my-4 relative z-10">
          
          {/* LEFT: MY PORTRAIT (我的画像) */}
          <div className="flex flex-col items-center">
            <div className="w-full relative rounded-2xl p-2 bg-gradient-to-b from-[#4A3816] via-[#2A1F0D] to-[#120D06] border-2 border-[#D4AF37] shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,248,222,0.4)]">
              
              {/* Corner Brass Ornaments */}
              <div className="absolute top-1 left-1 text-[8px] text-[#FFE599] opacity-75">⚜️</div>
              <div className="absolute top-1 right-1 text-[8px] text-[#FFE599] opacity-75">⚜️</div>
              <div className="absolute bottom-1 left-1 text-[8px] text-[#FFE599] opacity-75">⚜️</div>
              <div className="absolute bottom-1 right-1 text-[8px] text-[#FFE599] opacity-75">⚜️</div>

              {/* Inner Canvas Stage with Subtle Oil Painting Breathing */}
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#0D1522] border border-[#D4AF37]/40 flex items-center justify-center">
                {myPhoto ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.025, 1],
                      filter: ['contrast(1.05) brightness(1)', 'contrast(1.08) brightness(1.04)', 'contrast(1.05) brightness(1)']
                    }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    className="w-full h-full relative"
                  >
                    <img
                      src={myPhoto}
                      alt="我的画像"
                      className="w-full h-full object-cover filter contrast-105"
                    />
                    {/* Oil canvas woven texture overlay */}
                    <div className="absolute inset-0 bg-radial from-transparent to-black/35 pointer-events-none" />
                  </motion.div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-[#A8987E] hover:text-[#FFE599] transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1A2638] text-[#D4AF37] flex items-center justify-center mb-2 shadow-inner border border-[#D4AF37]/50 group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#F5EBD9] font-serif">封存今日容颜</span>
                    <span className="text-[9px] text-[#8C7658] mt-0.5">摄入魔镜油画</span>
                  </button>
                )}
              </div>

              {/* Pedestal Brass Tag */}
              <div className="mt-2 flex items-center justify-between px-1">
                <span className="text-[8.5px] font-cinzel text-[#C5A059] tracking-wider font-bold">
                  {myPhoto ? '· MY PORTRAIT ·' : '· VACANT ·'}
                </span>
                {myPhoto && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[8.5px] text-[#FFE599] font-serif hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <RotateCw className="w-2.5 h-2.5" />
                    重摄
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* RIGHT: HER PORTRAIT (她的画像 - 支持急急现形咒拂拭) */}
          <div className="flex flex-col items-center">
            <div className="w-full relative rounded-2xl p-2 bg-gradient-to-b from-[#4A3816] via-[#2A1F0D] to-[#120D06] border-2 border-[#FFE599] shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,248,222,0.4)]">
              
              {/* Corner Brass Ornaments */}
              <div className="absolute top-1 left-1 text-[8px] text-[#FFE599] opacity-75">⚜️</div>
              <div className="absolute top-1 right-1 text-[8px] text-[#FFE599] opacity-75">⚜️</div>
              <div className="absolute bottom-1 left-1 text-[8px] text-[#FFE599] opacity-75">⚜️</div>
              <div className="absolute bottom-1 right-1 text-[8px] text-[#FFE599] opacity-75">⚜️</div>

              {/* Inner Canvas Stage */}
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#0D1522] border border-[#FFE599]/40 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.025, 1],
                    filter: ['contrast(1.05) brightness(1)', 'contrast(1.08) brightness(1.04)', 'contrast(1.05) brightness(1)']
                  }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                  className="w-full h-full relative"
                >
                  <img
                    src={partnerPhoto}
                    alt="对方画像"
                    className="w-full h-full object-cover filter contrast-105"
                  />
                  <div className="absolute inset-0 bg-radial from-transparent to-black/35 pointer-events-none" />
                </motion.div>

                {/* Silver Mercury Frost Layer (急急现形咒擦拭图层) */}
                {!isUnlocked && (
                  <canvas
                    ref={mirrorCanvasRef}
                    onMouseMove={handleWipe}
                    onTouchMove={handleWipe}
                    className="absolute inset-0 w-full h-full cursor-crosshair z-20 touch-none"
                  />
                )}

                {/* Interactive Golden Stickers */}
                <AnimatePresence>
                  {isUnlocked &&
                    stickers.map((st) => (
                      <motion.span
                        key={st.id}
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 6 }}
                        className="absolute pointer-events-none select-none text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] z-30"
                        style={{ left: `${st.x}%`, top: `${st.y}%` }}
                      >
                        {st.emoji}
                      </motion.span>
                    ))}
                </AnimatePresence>
              </div>

              {/* Pedestal Brass Tag */}
              <div className="mt-2 flex items-center justify-between px-1">
                <span className="text-[8.5px] font-cinzel text-[#FFE599] tracking-wider font-bold">
                  {isUnlocked ? '· HER PORTRAIT ·' : '· FROSTED ·'}
                </span>
                <span className="text-[8px] font-mono text-[#A8987E]">
                  {isUnlocked ? '12:30 显影' : '封存在雾中'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Latin Arch Inscription Banner */}
        <div className="w-full py-1.5 px-3 rounded-xl bg-[#121C2B]/80 border border-[#D4AF37]/30 text-center mb-3">
          <p className="text-[8.5px] font-cinzel tracking-[0.25em] text-[#FFE599] font-bold opacity-80">
            {ERISED_LATIN}
          </p>
          <p className="text-[8px] font-serif text-[#A8987E] italic mt-0.5">
            “我显现的并非虚妄之相，而是你心之所向。”
          </p>
        </div>

        {/* ========================================================
            3. GOLDEN WAND STAMP REACTIONS (金箔符文印记)
        ======================================================== */}
        <div className="pt-2 border-t border-[#D4AF37]/25 flex items-center justify-between">
          <span className="text-[9.5px] font-serif text-[#C5A059] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FFE599]" />
            盖下金箔印记：
          </span>
          <div className="flex items-center gap-1.5">
            {['⚜️', '👑', '📜', '💍', '❤️', '⚡'].map((emoji) => (
              <motion.button
                key={emoji}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleAddSticker(emoji)}
                className="w-7 h-7 rounded-lg bg-[#142032] hover:bg-[#1E2E47] border border-[#D4AF37]/40 flex items-center justify-center text-xs transition-colors shadow-xs cursor-pointer"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
