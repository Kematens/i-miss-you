import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, Trash2, Send, Sparkles, Undo2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DoodleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#8C1D35');
  const [brushSize, setBrushSize] = useState(3.5);
  const [sentToast, setSentToast] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Hogwarts Apothecary Ink Pots
  const INK_POTS = [
    { name: 'Gryffindor Burgundy', label: '绯红火漆墨', hex: '#8C1D35' },
    { name: 'Imperial Gold', label: '纯金荧光墨', hex: '#D4AF37' },
    { name: 'Ravenclaw Oxford', label: '午夜靛蓝墨', hex: '#182638' },
    { name: 'Slytherin Emerald', label: '深林翡翠墨', hex: '#1B4D3E' },
    { name: 'Apothecary Amber', label: '琥珀魔药墨', hex: '#B45309' },
    { name: 'Ancient Charcoal', label: '陈年焦炭墨', hex: '#2C2219' }
  ];

  // Initialize and handle dynamic resize with 1:1 pixel coordinates
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set physical buffer size
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    // Normalize coordinates so 1 unit = 1 CSS pixel
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
  };

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, []);

  // Update stroke style whenever color or size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
  }, [color, brushSize]);

  // Accurate coordinate calculation supporting mobile touch and mouse
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Only handle primary pointer (single finger or left click)
    if (!e.isPrimary) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Capture pointer to prevent mobile page scrolling while drawing
    canvas.setPointerCapture(e.pointerId);

    // Save current canvas state to history for undo
    try {
      const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-9), currentState]);
    } catch {}

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw an initial point for tap/dot
    ctx.lineTo(x, y);
    ctx.stroke();

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !e.isPrimary) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lastState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    ctx.putImageData(lastState, 0, 0);

    if (history.length <= 1) {
      setHasDrawn(false);
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([10]);
      } catch {}
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform before clearing entire buffer
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    setHasDrawn(false);
    setHistory([]);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }
  };

  const handleSend = () => {
    setSentToast(true);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 35, 60]);
      } catch {}
    }

    confetti({
      particleCount: 35,
      spread: 70,
      origin: { y: 0.4 },
      colors: ['#D4AF37', '#FFF2CE', '#AA822A', '#8C1D35']
    });

    setTimeout(() => {
      setSentToast(false);
    }, 3200);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-5 font-serif select-none">
      {/* Victorian Parchment Drawing Desk */}
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-4 sm:p-5 text-[#2C241E] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9C89E]/60 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/40 text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <Feather className="w-4 h-4 text-[#FFE599]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                  QUILL & INK · 羽毛笔金墨
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#8C1D35] font-cinzel border border-[#D4AF37]/30">
                  TOUCH OPTIMIZED
                </span>
              </div>
              <h2 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                羊皮笺手绘 · 墨迹即刻传书
              </h2>
            </div>
          </div>
          <span className="text-[10px] text-[#C5A059] font-cinzel tracking-wider font-bold">
            PARCHMENT
          </span>
        </div>

        {/* Parchment Canvas Stage with Pointer Events & Touch-Action None */}
        <div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden bg-[#FAF5EB] border-2 border-[#D4AF37]/45 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]"
          style={{ touchAction: 'none' }}
        >
          {/* Faint watermark in background */}
          <div className="absolute right-3 bottom-2 opacity-5 pointer-events-none font-cinzel text-5xl select-none text-[#8C1D35]">
            ⚜️
          </div>

          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-52 block cursor-crosshair relative z-10"
            style={{ touchAction: 'none' }}
          />

          {!hasDrawn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-[#A8987E] text-xs font-serif italic space-y-1">
              <span className="text-sm opacity-60">🪶</span>
              <span>以指尖或画笔在此写下心绪，无滑动漂移...</span>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
          
          {/* 1. Apothecary Ink Bottles & Brush Sizes */}
          <div className="flex items-center gap-1.5 bg-[#FAF6EE] p-1.5 rounded-2xl border border-[#D9C89E]/60">
            {INK_POTS.map((c) => {
              const isSelected = color === c.hex;
              return (
                <button
                  key={c.hex}
                  onClick={() => {
                    setColor(c.hex);
                    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                      try {
                        navigator.vibrate([10]);
                      } catch {}
                    }
                  }}
                  title={c.label}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                    isSelected ? 'scale-115 ring-2 ring-[#D4AF37] ring-offset-1 shadow-xs' : 'hover:scale-105 opacity-80'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white/90" />}
                </button>
              );
            })}

            {/* Brush Stroke Toggle */}
            <div className="h-4 w-[1px] bg-[#D9C89E] mx-1" />
            <button
              onClick={() => setBrushSize((prev) => (prev === 2.5 ? 4.5 : prev === 4.5 ? 7 : 2.5))}
              className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#FAF5EB] text-[#8C1D35] font-cinzel font-bold border border-[#D9C89E]/60 cursor-pointer"
              title="切换笔触粗细"
            >
              {brushSize === 2.5 ? '细' : brushSize === 4.5 ? '中' : '粗'}
            </button>
          </div>

          {/* 2. Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                history.length > 0
                  ? 'bg-[#FAF5EB] text-[#8C7658] hover:text-[#8C1D35] border-[#D9C89E]'
                  : 'bg-[#FAF5EB]/50 text-[#C5B7A0] border-[#E8DCB8] cursor-not-allowed'
              }`}
              title="撤销上一笔"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            {/* Clear */}
            <button
              onClick={handleClear}
              className="p-2 rounded-xl bg-[#FAF5EB] text-[#8C7658] hover:text-[#8C1D35] hover:bg-[#EADBC4] border border-[#D9C89E]/70 transition-colors cursor-pointer"
              title="抹去墨迹"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Send */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!hasDrawn}
              className={`px-3.5 py-2 rounded-xl text-xs font-cinzel font-bold tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
                hasDrawn
                  ? 'bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] cursor-pointer border border-[#D4AF37]/50 hover:brightness-105'
                  : 'bg-[#EADBC4]/40 text-[#A8987E] cursor-not-allowed border-transparent'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-[#FFE599]" />
              <span>TRANSMIT 飞递</span>
            </motion.button>
          </div>
        </div>

        {/* Transmission Notification */}
        <AnimatePresence>
          {sentToast && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2.5 p-2.5 rounded-xl bg-[#FAF5EB] border border-[#D4AF37] text-[#8C1D35] text-xs font-serif flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>墨迹已穿透空间屏障，由猫头鹰火速投递至对方手札 ✨</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
