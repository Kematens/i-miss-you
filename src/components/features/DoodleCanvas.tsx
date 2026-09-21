import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Feather, Trash2, Send, Check } from 'lucide-react';
import { SpotlightCard } from '../animations/SpotlightCard';

export const DoodleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#8C1D35');
  const [brushSize] = useState(3.5);
  const [sentToast, setSentToast] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const colors = [
    { name: 'Burgundy', hex: '#8C1D35' },
    { name: 'Gold', hex: '#C5A059' },
    { name: 'Oxford', hex: '#1E293B' },
    { name: 'Forest', hex: '#166534' },
    { name: 'Amber', hex: '#B45309' },
    { name: 'Charcoal', hex: '#33281E' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSend = () => {
    setSentToast(true);
    setTimeout(() => {
      setSentToast(false);
    }, 2500);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 font-serif">
      <SpotlightCard className="p-5 sm:p-6" spotlightColor="rgba(212, 175, 55, 0.2)">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#EADBC4]/70 border border-[#D4AF37]/40 text-[#8C1D35] flex items-center justify-center shadow-xs">
              <Feather className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#2C241E] font-cinzel tracking-wider">
                QUILL & INK · 羽毛笔手札
              </h2>
              <p className="text-[11px] text-[#8C7658]">
                羊皮手绘 · 墨迹实时同步
              </p>
            </div>
          </div>
          <span className="text-[10px] text-[#C5A059] font-cinzel tracking-wider">
            PARCHMENT
          </span>
        </div>

        {/* Board */}
        <div className="relative rounded-2xl overflow-hidden bg-[#FAF6EE] border border-[#D9C89E] shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-44 touch-none cursor-crosshair relative z-10"
          />

          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[#A8987E] text-xs font-serif italic">
              蘸取墨水，在此随心书写或绘图...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c.hex)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  color === c.hex ? 'scale-120 ring-2 ring-offset-1 ring-[#D4AF37]' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClear}
              className="p-1.5 rounded-xl bg-[#EADBC4]/50 text-[#8C7658] hover:bg-[#EADBC4] border border-[#D9C89E]/60 transition-colors"
              title="抹去墨迹"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!hasDrawn}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel tracking-wider flex items-center gap-1.5 transition-all ${
                hasDrawn
                  ? 'bg-[#8C1D35] text-[#F5EBD9] cursor-pointer shadow-xs border border-[#D4AF37]/50'
                  : 'bg-[#EADBC4]/40 text-[#A8987E] cursor-not-allowed border border-transparent'
              }`}
            >
              <Send className="w-3 h-3 text-[#F5E8BE]" />
              TRANSMIT
            </motion.button>
          </div>
        </div>

        {sentToast && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2.5 p-2 rounded-xl bg-[#FAF5EB] border border-[#D4AF37]/60 text-[#8C1D35] text-[11px] font-serif flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Check className="w-3.5 h-3.5 text-[#C5A059]" />
            墨迹已穿透空间，呈现在对方羊皮笺上 📜
          </motion.div>
        )}
      </SpotlightCard>
    </div>
  );
};
