import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCouple } from '../../context/CoupleContext';
import { UserRole } from '../../services/storage';

export const PairingModal: React.FC = () => {
  const {
    pairingCode,
    setPairingCode,
    myRole,
    setMyRole,
    partnerRole,
    partnerOnline,
    isConnected,
    showPairingModal,
    setShowPairingModal,
    conflictNotice,
    clearConflictNotice
  } = useCouple();

  const [inputCode, setInputCode] = useState(pairingCode);
  const [copied, setCopied] = useState(false);

  if (!showPairingModal) return null;

  const handleSave = () => {
    if (!inputCode.trim()) return;
    setPairingCode(inputCode.trim().toUpperCase());
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 35, 60]);
      } catch {}
    }
    confetti({
      particleCount: 30,
      spread: 55,
      origin: { y: 0.5 },
      colors: ['#D4AF37', '#8C1D35', '#FFF2CE']
    });
    setShowPairingModal(false);
  };

  const handleSelectRole = (role: UserRole) => {
    setMyRole(role);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 25]);
      } catch {}
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-[#111A27]/75 flex items-center justify-center p-4 font-serif">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          className="w-full max-w-sm rounded-3xl p-6 bg-[#FCF9F2] shadow-2xl border border-[#D4AF37]/60 relative text-[#2C241E]"
        >
          {/* Close button */}
          <button
            onClick={() => setShowPairingModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#8C7658] hover:text-[#2C241E] hover:bg-[#EADBC4]/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#8C1D35] text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-cinzel tracking-wider text-[#2C241E]">
                SECRET CIPHER · 双向暗号配对
              </h3>
              <p className="text-[10px] text-[#8C7658] font-serif">
                二人同心 · 跨越山海同频感应
              </p>
            </div>
          </div>

          {/* Conflict notice alert */}
          {conflictNotice && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="my-3 p-2.5 rounded-xl bg-[#8C1D35]/10 border border-[#8C1D35]/30 text-xs text-[#8C1D35] flex items-start gap-2"
            >
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-tight">
                {conflictNotice}
              </div>
              <button onClick={clearConflictNotice} className="text-[#8C1D35] font-bold text-xs">
                ✕
              </button>
            </motion.div>
          )}

          {/* Connection badge */}
          <div className="mt-3 mb-4 p-2.5 rounded-2xl bg-[#F5EFE3] border border-[#D9C89E]/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isConnected && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${partnerOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${partnerOnline ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
              </span>
              <span className="text-[11px] font-medium text-[#524336]">
                {partnerOnline ? '对方已同频在线' : '等待对方入席 · 随时待命'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E8DCB8]/60 text-[#7A633F]">
              {isConnected ? 'LIVE CHANNEL' : 'OFFLINE'}
            </span>
          </div>

          {/* Role selection */}
          <div className="mb-4">
            <label className="block text-[11px] font-medium text-[#524336] mb-1.5 font-cinzel flex items-center justify-between">
              <span>MY ROLE · 当前角色身份</span>
              <span className="text-[10px] text-[#8C7658]">对方即为 {partnerRole === 'HE' ? '巫师 (HE)' : '女巫 (SHE)'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole('HE')}
                className={`py-2 px-3 rounded-xl border text-xs font-serif flex items-center justify-center gap-1.5 transition-all ${
                  myRole === 'HE'
                    ? 'bg-[#8C1D35] text-[#F5EBD9] border-[#D4AF37] shadow-xs'
                    : 'bg-[#FAF6EE] text-[#665440] border-[#D9C89E]/60 hover:bg-[#EFE7D5]'
                }`}
              >
                <span>🪄</span>
                <span className="font-semibold">我是 巫师 (HE)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('SHE')}
                className={`py-2 px-3 rounded-xl border text-xs font-serif flex items-center justify-center gap-1.5 transition-all ${
                  myRole === 'SHE'
                    ? 'bg-[#8C1D35] text-[#F5EBD9] border-[#D4AF37] shadow-xs'
                    : 'bg-[#FAF6EE] text-[#665440] border-[#D9C89E]/60 hover:bg-[#EFE7D5]'
                }`}
              >
                <span>✨</span>
                <span className="font-semibold">我是 女巫 (SHE)</span>
              </button>
            </div>
          </div>

          {/* Cipher input */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-[#524336] font-cinzel">
                SHARED CIPHER · 二人专属暗号
              </label>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inputCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="text-[10px] text-[#C5A059] hover:underline"
              >
                {copied ? '已复制暗号' : '复制暗号'}
              </button>
            </div>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="例如 LUMOS-7788 或 0520"
              className="w-full text-center text-sm font-mono tracking-widest px-3 py-2.5 rounded-xl border border-[#D9C89E] focus:outline-none focus:ring-1 focus:ring-[#C5A059] bg-[#FAF6EE] text-[#2C241E] font-bold"
            />
            <p className="text-[10px] text-[#8C7658] mt-1.5 leading-relaxed">
              只要两台手机的暗号一致，且各选不同角色，即可在云端瞬间同频互联。
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowPairingModal(false)}
              className="flex-1 py-2 rounded-xl text-xs font-serif bg-[#EADBC4]/40 text-[#665440] hover:bg-[#EADBC4] transition-colors border border-[#D9C89E]/60"
            >
              稍后设置
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-xl text-xs font-cinzel tracking-wider font-semibold bg-[#8C1D35] text-[#F5EBD9] hover:bg-[#6B1226] shadow-sm transition-colors border border-[#D4AF37]/50"
            >
              确认并同步
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
