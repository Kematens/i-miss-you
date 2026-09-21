import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Bird, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OwlSlingButtonProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  value: string;
}

export const OwlSlingButton: React.FC<OwlSlingButtonProps> = ({ onSend, disabled = false, value }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw drag coordinates
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // React Bits high-fidelity spring recoil simulation (damping 18, stiffness 400)
  const springConfig = { damping: 18, stiffness: 380, mass: 0.6 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);

  // Real-time dynamic SVG slingshot anchors (in viewBox coordinates)
  // Seat is at (40, 24). Anchor points are Left: (8, 14), Right: (8, 34)
  const [cordCoords, setCordCoords] = useState({ padX: 40, padY: 24, pullDist: 0 });

  useEffect(() => {
    const unsubX = smoothX.on('change', (latestX) => {
      const curY = smoothY.get();
      const dist = Math.sqrt(latestX * latestX + curY * curY);
      setCordCoords({
        padX: 40 + latestX,
        padY: 24 + curY,
        pullDist: dist
      });
      setIsArmed(dist >= 28);
    });
    return () => unsubX();
  }, [smoothX, smoothY]);

  // Pointer drag events for real physics drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || !value.trim() || isFlying) return;
    setIsPulling(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(18);
      } catch {
        // ignore
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPulling) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Relative to the pad's origin
    const originX = rect.left + rect.width - 24;
    const originY = rect.top + rect.height / 2;

    let deltaX = e.clientX - originX;
    let deltaY = e.clientY - originY;

    // Calculate pull distance and clamp to MAX_PULL = 60
    const pullDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const MAX_PULL = 56;
    if (pullDist > MAX_PULL) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * MAX_PULL;
      deltaY = Math.sin(angle) * MAX_PULL;
    }

    rawX.set(deltaX);
    rawY.set(deltaY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPulling) return;
    setIsPulling(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const curX = rawX.get();
    const curY = rawY.get();
    const dist = Math.sqrt(curX * curX + curY * curY);

    if (dist >= 26 && value.trim()) {
      launchOwl();
    } else {
      // Slingshot snap back with spring recoil
      rawX.set(0);
      rawY.set(0);
    }
  };

  const launchOwl = () => {
    setIsFlying(true);
    // Instantaneous elastic recoil snap back for the cord
    rawX.set(0);
    rawY.set(0);

    // Haptic snap pulse
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 40, 80]);
      } catch {
        // ignore
      }
    }

    confetti({
      particleCount: 28,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#D4AF37', '#FFF2CE', '#AA822A', '#8C1D35']
    });

    onSend(value);

    setTimeout(() => {
      setIsFlying(false);
    }, 1300);
  };

  const handleDirectClick = () => {
    if (disabled || !value.trim() || isFlying || isPulling) return;
    launchOwl();
  };

  // String band thickness thins down realistically as tension increases
  const cordStrokeWidth = Math.max(1.2, 2.8 - (cordCoords.pullDist / 56) * 1.4);

  return (
    <div
      ref={containerRef}
      className="relative w-20 h-11 select-none flex items-center justify-end pr-1 touch-none"
    >
      {/* 1. Authentic SVG Slingshot Band Physics (Dynamic Cords + Anchor Pegs) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10"
        viewBox="0 0 60 48"
      >
        <defs>
          <filter id="cordGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Golden Anchor Posts (Top & Bottom Fork Tips on the left) */}
        <circle cx="8" cy="14" r="2.8" fill="#D4AF37" stroke="#684A1C" strokeWidth="1" />
        <circle cx="8" cy="34" r="2.8" fill="#D4AF37" stroke="#684A1C" strokeWidth="1" />

        {/* Top Elastic Cord to Pad */}
        <line
          x1="8"
          y1="14"
          x2={cordCoords.padX}
          y2={cordCoords.padY - 2}
          stroke={isArmed ? '#D4AF37' : '#7D122B'}
          strokeWidth={cordStrokeWidth}
          strokeLinecap="round"
          filter="url(#cordGlow)"
        />

        {/* Bottom Elastic Cord to Pad */}
        <line
          x1="8"
          y1="34"
          x2={cordCoords.padX}
          y2={cordCoords.padY + 2}
          stroke={isArmed ? '#D4AF37' : '#7D122B'}
          strokeWidth={cordStrokeWidth}
          strokeLinecap="round"
          filter="url(#cordGlow)"
        />

        {/* Slingshot Leather Pocket / Well Ring */}
        <circle
          cx={cordCoords.padX}
          cy={cordCoords.padY}
          r="13"
          fill="none"
          stroke={isArmed ? '#FFE599' : '#D4AF37'}
          strokeWidth="1.2"
          strokeDasharray="2 2"
          opacity={isPulling ? 0.9 : 0.4}
        />
      </svg>

      {/* 2. Flying Hedwig Owl (Lucide Bird with authentic parchment parcel flight) */}
      <AnimatePresence>
        {isFlying && (
          <motion.div
            initial={{ x: 0, y: 0, scale: 1, rotate: -10, opacity: 1 }}
            animate={{
              x: [0, 160, 380],
              y: [0, -110, -320],
              scale: [1, 1.3, 0.4],
              rotate: [-10, 20, 38],
              opacity: [1, 1, 0]
            }}
            transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 pointer-events-none flex flex-col items-center"
          >
            {/* Elegant Golden & White Royal Courier Owl Badge */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8C1D35] via-[#A51D38] to-[#520B1C] border border-[#FFE599] flex items-center justify-center shadow-[0_6px_20px_rgba(212,175,55,0.7)]">
              <Bird className="w-6 h-6 text-[#FFFDF8] filter drop-shadow-md animate-pulse" />
              
              {/* Rolled Epistle Scroll Hanging in Talons */}
              <div className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-[#FAF5EB] border border-[#8C1D35] text-[7px] font-cinzel font-bold text-[#8C1D35] shadow-xs flex items-center gap-0.5">
                <span>EPISTLE</span>
              </div>
            </div>

            {/* Trailing Magic Stardust */}
            <div className="flex items-center gap-1 mt-1 text-[#D4AF37] text-[8.5px] font-cinzel font-bold tracking-widest">
              <Sparkles className="w-2.5 h-2.5" />
              <span>DISPATCHED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. The Draggable Slingshot Pad with Lucide Royal Owl */}
      {!isFlying && (
        <motion.div
          style={{ x: smoothX, y: smoothY }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleDirectClick}
          whileHover={{ scale: value.trim() ? 1.06 : 1 }}
          whileTap={{ scale: 0.94 }}
          className={`relative z-20 w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing shadow-sm ${
            value.trim()
              ? isArmed
                ? 'bg-gradient-to-br from-[#A51D38] to-[#7D122B] border-2 border-[#FFE599] text-[#FFFDF8] shadow-[0_0_15px_rgba(212,175,55,0.8)]'
                : 'bg-gradient-to-br from-[#8C1D35] to-[#520B1C] border border-[#D4AF37] text-[#FFFDF8]'
              : 'bg-[#EADBC4]/40 border border-[#D9C89E]/60 text-[#A8987E] cursor-not-allowed'
          }`}
          title={value.trim() ? '按住向左后方拉伸弹弓发射，或直接轻触直飞' : '写下心事后方可发射'}
        >
          {/* Official Royal Owl Emblem from Lucide Icons */}
          <Bird className={`w-4.5 h-4.5 transition-transform duration-200 ${isPulling ? 'scale-110' : ''}`} />

          {/* Micro Pull/Shoot Indicator */}
          {value.trim() && !isPulling && (
            <span className="absolute -bottom-3 text-[7.5px] font-cinzel text-[#8C7658] whitespace-nowrap opacity-75 pointer-events-none">
              SLING
            </span>
          )}

          {isPulling && (
            <span className="absolute -top-3.5 text-[7px] font-cinzel font-bold text-[#8C1D35] whitespace-nowrap bg-[#FFFDF8] px-1 rounded border border-[#D9C89E] pointer-events-none">
              {isArmed ? 'RELEASE!' : 'PULL'}
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
};
