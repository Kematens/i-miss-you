import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Lock, Sparkles } from 'lucide-react';
import { StickerPeel } from '../animations/StickerPeel';
import { SpotlightCard } from '../animations/SpotlightCard';

interface FloatingSticker {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export const TodayLook: React.FC = () => {
  const [myPhoto, setMyPhoto] = useState<string | null>(null);
  const [partnerPhoto] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');
  const [stickers, setStickers] = useState<FloatingSticker[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMyPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSticker = (emoji: string) => {
    const newSticker: FloatingSticker = {
      id: Date.now(),
      emoji,
      x: 25 + Math.random() * 50,
      y: 25 + Math.random() * 50
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const isUnlocked = Boolean(myPhoto);

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 font-serif">
      <SpotlightCard className="p-5 sm:p-6" spotlightColor="rgba(212, 175, 55, 0.2)">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#EADBC4]/70 border border-[#D4AF37]/40 text-[#8C1D35] flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#2C241E] font-cinzel tracking-wider">
                MAGIC PORTRAITS · 今日画像
              </h2>
              <p className="text-[11px] text-[#8C7658]">
                双人画像封存 · 互传方可显影
              </p>
            </div>
          </div>
          <span className="text-[10px] text-[#C5A059] font-cinzel tracking-wider">
            CHRONICLE
          </span>
        </div>

        {/* Dual Layout */}
        <div className="grid grid-cols-2 gap-3 mb-3.5">
          {/* My Photo */}
          <div className="flex flex-col items-center">
            <StickerPeel tag="MY PORTRAIT" className="w-full">
              <div className="p-2.5 bg-[#FAF6EE] border border-[#E8DCB8] flex flex-col items-center shadow-sm">
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#EFE7D5] flex items-center justify-center border border-[#D9C89E]/60">
                  {myPhoto ? (
                    <img
                      src={myPhoto}
                      alt="我的画像"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-3 text-center text-[#8C7658] hover:text-[#520B1C] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EADBC4] text-[#8C1D35] flex items-center justify-center mb-1.5 shadow-2xs border border-[#D9C89E]">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-[#3D3025]">封存今日</span>
                      <span className="text-[9px] text-[#8C7658]">点击摄取画像</span>
                    </button>
                  )}
                </div>
                <div className="w-full flex justify-between items-center mt-2 px-0.5">
                  <span className="text-[10px] text-[#7A6750] font-cinzel">
                    {myPhoto ? 'RECORDED' : 'AWAITING'}
                  </span>
                  {myPhoto && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[9px] text-[#8C1D35] underline"
                    >
                      重新封存
                    </button>
                  )}
                </div>
              </div>
            </StickerPeel>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Partner Photo */}
          <div className="flex flex-col items-center">
            <StickerPeel tag="HIS PORTRAIT" className="w-full">
              <div className="p-2.5 bg-[#FAF6EE] border border-[#E8DCB8] flex flex-col items-center shadow-sm">
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#EFE7D5] flex items-center justify-center border border-[#D9C89E]/60">
                  <img
                    src={partnerPhoto}
                    alt="对方画像"
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isUnlocked ? 'filter-none scale-100' : 'filter blur-md scale-105 opacity-60'
                    }`}
                  />

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-[#1A140F]/45 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center text-[#FAF5EB]">
                      <div className="w-8 h-8 rounded-full bg-[#FAF5EB]/20 backdrop-blur-md flex items-center justify-center mb-1.5 border border-[#D4AF37]/40 shadow-xs">
                        <Lock className="w-4 h-4 text-[#F5E8BE]" />
                      </div>
                      <span className="text-[10px] leading-relaxed font-serif text-[#F5E8BE]">
                        封存你的画像<br />方可显影对方
                      </span>
                    </div>
                  )}

                  <AnimatePresence>
                    {isUnlocked &&
                      stickers.map((st) => (
                        <motion.span
                          key={st.id}
                          initial={{ scale: 0, rotate: -15 }}
                          animate={{ scale: 1, rotate: 5 }}
                          className="absolute pointer-events-none select-none text-2xl drop-shadow-md"
                          style={{ left: `${st.x}%`, top: `${st.y}%` }}
                        >
                          {st.emoji}
                        </motion.span>
                      ))}
                  </AnimatePresence>
                </div>

                <div className="w-full flex justify-between items-center mt-2 px-0.5">
                  <span className="text-[10px] text-[#7A6750] font-cinzel">
                    {isUnlocked ? 'REVEALED' : 'ENCHANTED'}
                  </span>
                  <span className="text-[9px] text-[#A8987E]">12:30 显影</span>
                </div>
              </div>
            </StickerPeel>
          </div>
        </div>

        {/* Reaction */}
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2.5 border-t border-[#E8DCB8] flex items-center justify-between"
          >
            <span className="text-[10px] text-[#8C7658] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C5A059]" />
              金箔印记互动：
            </span>
            <div className="flex items-center gap-1.5">
              {['⚜️', '👑', '📜', '🕯️', '💍', '❤️'].map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAddSticker(emoji)}
                  className="w-7 h-7 rounded-lg bg-[#FAF5EB] hover:bg-[#F4EBD9] border border-[#D9C89E]/60 flex items-center justify-center text-xs transition-colors shadow-2xs"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </SpotlightCard>
    </div>
  );
};
