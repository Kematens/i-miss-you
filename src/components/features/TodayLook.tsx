import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Lock, Sparkles, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StickerPeel } from '../animations/StickerPeel';
import { useCouple } from '../../context/CoupleContext';
import { appStorage } from '../../services/storage';

interface FloatingSticker {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

// Compress photo to max 600px dimension and WebP/JPEG format under 80KB
function compressImage(file: File, maxDimension = 600, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webp = canvas.toDataURL('image/webp', quality);
          if (webp.startsWith('data:image/webp')) {
            resolve(webp);
            return;
          }
        } catch {}
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const TodayLook: React.FC = () => {
  const { sendEvent, onEvent, myRole, partnerRole, partnerOnline } = useCouple();

  const [myPhoto, setMyPhoto] = useState<string | null>(() => {
    return appStorage.getMyPhoto()?.dataUrl || null;
  });

  const [partnerPhoto, setPartnerPhoto] = useState<string | null>(() => {
    return appStorage.getPartnerPhoto()?.dataUrl || null;
  });

  const [stickers, setStickers] = useState<FloatingSticker[]>([]);
  const [photoAlert, setPhotoAlert] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time synchronization
  useEffect(() => {
    const unsubPhoto = onEvent<{ dataUrl: string }>('TODAY_PHOTO', (payload) => {
      if (payload?.dataUrl) {
        setPartnerPhoto(payload.dataUrl);
        appStorage.setPartnerPhoto({
          dataUrl: payload.dataUrl,
          updatedAt: Date.now(),
          senderRole: partnerRole
        });
        setPhotoAlert('📸 对方刚刚摄取并封存了今日画像！');
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([30, 40, 50]);
          } catch {}
        }
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.4 },
          colors: ['#FFE599', '#D4AF37', '#8C1D35']
        });
        setTimeout(() => setPhotoAlert(null), 5000);
      }
    });

    const unsubSticker = onEvent<FloatingSticker>('ADD_STICKER', (payload) => {
      if (payload?.emoji) {
        setStickers((prev) => [...prev, payload]);
      }
    });

    return () => {
      unsubPhoto();
      unsubSticker();
    };
  }, [onEvent, partnerRole]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setMyPhoto(compressed);
        appStorage.setMyPhoto({
          dataUrl: compressed,
          updatedAt: Date.now(),
          senderRole: myRole
        });
        sendEvent('TODAY_PHOTO', { dataUrl: compressed, timestamp: Date.now() });

        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.4 },
          colors: ['#D4AF37', '#FFF2CE', '#AA822A', '#8C1D35']
        });
      } catch (err) {
        console.error('Photo compression failed', err);
      }
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
    sendEvent('ADD_STICKER', newSticker);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 20]);
      } catch {}
    }
  };

  const isUnlocked = Boolean(myPhoto);

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 font-serif select-none">
      {/* Warm Parchment Card Container */}
      <div className="relative rounded-3xl border border-[#D4AF37]/45 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-5 sm:p-6 text-[#2C241E] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9C89E]/60 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/40 text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4 text-[#FFE599]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                  MAGIC PORTRAITS · 今日画像
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#8C1D35] font-cinzel border border-[#D4AF37]/30">
                  {partnerOnline ? 'LIVE SYNC' : 'SAVED'}
                </span>
              </div>
              <h2 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                双人画像封存 · 互传方可显影
              </h2>
            </div>
          </div>
          <span className="text-[10px] text-[#C5A059] font-cinzel tracking-wider font-bold">
            DAILY LOOK
          </span>
        </div>

        {/* Sync Toast Alert */}
        <AnimatePresence>
          {photoAlert && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-3 p-2.5 rounded-xl bg-[#8C1D35]/10 border border-[#8C1D35]/30 text-xs text-[#8C1D35] flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-serif">{photoAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dual Layout with Washi Tape Sticky Notes */}
        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          {/* My Photo */}
          <div className="flex flex-col items-center">
            <StickerPeel tag={`MY LOOK (${myRole})`} className="w-full">
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
                      className="flex flex-col items-center justify-center p-3 text-center text-[#8C7658] hover:text-[#520B1C] transition-colors cursor-pointer"
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
                      className="text-[9px] text-[#8C1D35] underline cursor-pointer flex items-center gap-0.5"
                    >
                      <RotateCw className="w-2.5 h-2.5" />
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
            <StickerPeel tag={`PARTNER (${partnerRole})`} className="w-full">
              <div className="p-2.5 bg-[#FAF6EE] border border-[#E8DCB8] flex flex-col items-center shadow-sm">
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#EFE7D5] flex items-center justify-center border border-[#D9C89E]/60">
                  {partnerPhoto ? (
                    <img
                      src={partnerPhoto}
                      alt="对方画像"
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        isUnlocked ? 'filter-none scale-100' : 'filter blur-md scale-105 opacity-60'
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#FAF5EB] to-[#EAE0CD] text-[#8C7658] text-center select-none">
                      <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border-2 border-dashed border-[#D4AF37]/50 flex items-center justify-center mb-1.5 shadow-inner">
                        <span className="text-xl">🪄</span>
                      </div>
                      <span className="text-xs font-serif font-bold text-[#524336]">
                        静候对方显影今日画像
                      </span>
                      <span className="text-[8.5px] font-cinzel text-[#A8987E] mt-0.5">
                        AWAITING PEER PORTRAIT
                      </span>
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-[#1A140F]/60 flex flex-col items-center justify-center p-3 text-center text-[#FAF5EB]">
                      <div className="w-8 h-8 rounded-full bg-[#FAF5EB]/20 flex items-center justify-center mb-1.5 border border-[#D4AF37]/40 shadow-xs">
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
                          className="absolute pointer-events-none select-none text-2xl drop-shadow-md z-20"
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
                  className="w-7 h-7 rounded-lg bg-[#FAF5EB] hover:bg-[#F4EBD9] border border-[#D9C89E]/60 flex items-center justify-center text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
