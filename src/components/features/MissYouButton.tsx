import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Feather, Lock, Wand2, Mail, Bird } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CircularText } from '../animations/CircularText';
import { TimeTurner } from './TimeTurner';
import { SlingButton } from '../animations/SlingButton';
import { useCouple } from '../../context/CoupleContext';
import { appStorage } from '../../services/storage';

interface MissYouButtonProps {
  onNotify?: (message: string) => void;
}

const LOVE_LETTERS_POOL = [
  {
    line1: '“纵使相隔山海长街，”',
    line2: '“心跳同频之处，即是魔法所在。”',
    signature: '今日第一份想念已抵达，愿此光长伴于你 —— Always.'
  },
  {
    line1: '“世界喧嚣如翻涌浪潮，”',
    line2: '“唯有你的名字，是我永远的荧光闪烁（Lumos）。”',
    signature: '无论身处何地，你都在我最温软的心头。'
  },
  {
    line1: '“银河跌宕，星辰转动，”',
    line2: '“指针每一次微颤，都是我在无声地奔向你。”',
    signature: '想念跨越千山，已由夜翼猫头鹰衔至窗前。'
  },
  {
    line1: '“在平淡岁月的每一次呼吸间，”',
    line2: '“你是我永不熄灭的火焰杯，盛满所有的心动与偏爱。”',
    signature: '风有归期，心有归宿，愿岁月深爱于你。'
  },
  {
    line1: '“时间转换器能逆转光阴，”',
    line2: '“但关于你的每一秒，我都想完完整整地深深刻下。”',
    signature: '见信如面，愿你今日所有微风都带有蜜糖的清甜。'
  },
  {
    line1: '“霍格沃茨的猫头鹰掠过塔尖，”',
    line2: '“寄去的不止是一封信笺，而是我一整颗想念你的心。”',
    signature: '此时此刻，特别想你。'
  },
  {
    line1: '“若世间万物皆有引力，”',
    line2: '“那我所有的心轨，都只为你一人偏转。”',
    signature: '双星共振，引力波所至，爱意恒常。'
  },
  {
    line1: '“夜色落入羊皮纸的墨香，”',
    line2: '“愿梦里有林间微风，有漫天流光，还有我紧握你的手。”',
    signature: '晚安好梦，明日破晓时第一缕晨光也是想你的证明。'
  }
];

export const MissYouButton: React.FC<MissYouButtonProps> = ({ onNotify }) => {
  const { sendEvent, onEvent, myRole, partnerOnline } = useCouple();

  const [isOpen, setIsOpen] = useState(false);
  const [tapCount, setTapCount] = useState(1);
  const [whisper, setWhisper] = useState('');
  const [activeWhispers, setActiveWhispers] = useState<string[]>([]);
  const [justSent, setJustSent] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState<string | null>(null);

  const recipientTitle = myRole === 'HE' ? '女孩' : '少年';
  const letterIndex = (tapCount + new Date().getDate()) % LOVE_LETTERS_POOL.length;
  const currentLetter = LOVE_LETTERS_POOL[letterIndex] || LOVE_LETTERS_POOL[0];

  // Load persisted whispers on mount
  useEffect(() => {
    const saved = appStorage.getWhispers().map((w) => w.text);
    if (saved.length > 0) {
      setActiveWhispers(saved.slice(0, 3));
    }
  }, []);

  // Listen for real-time couple events
  useEffect(() => {
    const unsubMissYou = onEvent<{ tapCount: number }>('LUMOS_MISS_YOU', (_payload, sender) => {
      setIncomingAlert(`✨ 对方（${sender === 'HE' ? '巫师' : '女巫'}）刚刚熔开火漆，向你传递了同频想念！`);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 50, 70, 50, 100]);
        } catch {}
      }
      confetti({
        particleCount: 40,
        spread: 80,
        origin: { y: 0.35 },
        colors: ['#FFE599', '#D4AF37', '#FFF2CE', '#8C1D35']
      });
      setTimeout(() => setIncomingAlert(null), 5000);
    });

    const unsubWhisper = onEvent<{ text: string }>('OWL_WHISPER', (payload) => {
      if (payload?.text) {
        setActiveWhispers((prev) => [payload.text, ...prev.slice(0, 2)]);
        setIncomingAlert(`💌 猫头鹰送来对方的密札：“${payload.text}”`);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([30, 40, 30]);
          } catch {}
        }
        setTimeout(() => setIncomingAlert(null), 5000);
      }
    });

    return () => {
      unsubMissYou();
      unsubWhisper();
    };
  }, [onEvent]);

  // Hold-to-Break wax melting state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [showShockwave, setShowShockwave] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);

  const HOLD_DURATION_MS = 1000; // 1.0s crisp & responsive spell charging duration

  const handleStartHold = (e?: React.SyntheticEvent) => {
    if (e && e.cancelable) {
      e.preventDefault();
    }
    if (isOpen) return;
    setIsHolding(true);
    setHoldProgress(0);

    const startTime = Date.now();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // Fallback
      }
    }

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / HOLD_DURATION_MS) * 100));
      setHoldProgress(pct);

      if (pct % 30 === 0 && pct > 0 && pct < 100 && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(18);
        } catch {
          // ignore
        }
      }

      if (pct >= 100) {
        handleCompleteBreak();
      }
    }, 16);
  };

  const handleEndHold = (e?: React.SyntheticEvent) => {
    if (e && e.cancelable) {
      e.preventDefault();
    }
    if (holdProgress < 100) {
      setIsHolding(false);
      setHoldProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
  };

  const handleCompleteBreak = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setIsHolding(false);
    setHoldProgress(100);
    setShowShockwave(true);
    setIsOpen(true);
    setTapCount((prev) => prev + 1);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 90, 40, 120]);
      } catch {
        // Fallback
      }
    }

    confetti({
      particleCount: 55,
      spread: 95,
      origin: { y: 0.42 },
      colors: ['#FFE599', '#D4AF37', '#FFF2CE', '#AA822A', '#8C1D35', '#FFA07A']
    });

    setTimeout(() => {
      setShowShockwave(false);
    }, 1000);

    // Broadcast miss-you pulse to partner
    sendEvent('LUMOS_MISS_YOU', { tapCount: tapCount + 1, timestamp: Date.now() });

    if (onNotify) {
      onNotify('以荧光咒热度熔断火漆封印：密札已从信封抽开展阅 ✨');
    }
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Smooth optimistic whisper sending: clears immediately, updates letter postscripts
  const handleSendWhisper = useCallback(() => {
    const textToSend = whisper.trim();
    if (!textToSend) return;

    setWhisper('');
    setJustSent(true);
    setActiveWhispers((prev) => [textToSend, ...prev.slice(0, 2)]);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 30, 20]);
      } catch {
        // Safe fallback
      }
    }

    confetti({
      particleCount: 22,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#D4AF37', '#FFF2CE', '#AA822A', '#8C1D35']
    });

    // Persist whisper locally
    appStorage.addWhisper({
      id: Date.now(),
      text: textToSend,
      senderRole: myRole,
      timestamp: Date.now()
    });

    // Broadcast owl whisper to partner
    sendEvent('OWL_WHISPER', { text: textToSend });

    if (onNotify) {
      onNotify(`附添密札私语：“${textToSend}”`);
    }

    setTimeout(() => {
      setJustSent(false);
    }, 3200);
  }, [whisper, onNotify]);

  // SVG circular progress parameters
  const sealRadius = 78;
  const strokeWidth = 3.5;
  const normalizedRadius = sealRadius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 font-serif select-none space-y-4">
      {/* Realtime Partner Message Banner */}
      <AnimatePresence>
        {incomingAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="p-3 rounded-2xl bg-[#8C1D35]/15 border border-[#D4AF37]/70 text-[#520B1C] shadow-sm flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-medium font-serif leading-snug">{incomingAlert}</span>
            </div>
            <button
              onClick={() => setIncomingAlert(null)}
              className="text-[#8C1D35] hover:text-[#520B1C] font-bold text-xs px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ========================================================
          1. REAL ANTIQUE ENVELOPE (一体化古典羊皮纸封筒道具)
      ======================================================== */}
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#F9F4EA] shadow-[0_20px_50px_-12px_rgba(45,30,15,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden">
        
        {/* Postal Stamp & Postmark Header */}
        <div className="p-5 pb-3 border-b border-[#D9C89E]/50 flex items-start justify-between bg-[#FCF8F0]/70 relative z-20">
          {/* Hogsmeade Round Postmark */}
          <div className="border border-[#8C7658]/50 rounded-full w-13 h-13 p-1 flex flex-col items-center justify-center text-center opacity-80 rotate-[-6deg] shrink-0">
            <span className="text-[7.5px] font-cinzel font-bold text-[#8C1D35] leading-none">HOGSMEADE</span>
            <span className="text-[6.5px] font-mono text-[#8C7658] my-0.5">POST 1897</span>
            <span className="text-[6px] font-cinzel text-[#8C1D35] tracking-wider leading-none">EXPRESS</span>
          </div>

          {/* Postal Recipient Calligraphy */}
          <div className="flex-1 px-3 pt-0.5">
            <div className="text-[9px] font-cinzel text-[#8C7658] tracking-widest uppercase flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-[#C5A059]" />
              <span>OWL EXPRESS · 皇家特快信使</span>
            </div>
            <div className="text-xs font-serif font-bold text-[#2C241E] mt-0.5">
              致：心间至珍至爱之{recipientTitle} · 展信舒颜
            </div>
            <div className="text-[9.5px] text-[#A8987E] font-serif italic flex items-center gap-1.5">
              <span>霍格莫德街角 · 彼此心跳同频处</span>
              {partnerOnline && (
                <span className="text-[9px] text-[#C5A059] not-italic font-mono font-medium">
                  · 对方同频在线 ✨
                </span>
              )}
            </div>
          </div>

          {/* Serrated Hogwarts Stamp */}
          <div className="w-11 h-13 rounded bg-[#FAF5EB] border-2 border-dashed border-[#C5A059] flex flex-col items-center justify-between p-1 shadow-2xs rotate-[4deg] shrink-0">
            <div className="w-full text-center text-[7px] font-cinzel text-[#8C7658] border-b border-[#E8DCB8]">
              HOGWARTS
            </div>
            <span className="text-sm">⚜️</span>
            <div className="text-[7px] font-mono font-bold text-[#8C1D35]">
              10 KNUTS
            </div>
          </div>
        </div>

        {/* ========================================================
            ENVELOPE BODY & LETTER STAGE (信封腔体与滑出信纸)
        ======================================================== */}
        <div className="relative min-h-[330px] p-4 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isOpen ? (
              /* --------------------------------------------------------
                  A. THE PARCHMENT LETTER (抽出的信纸)
              -------------------------------------------------------- */
              <motion.div
                key="extracted-letter"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full relative z-30"
              >
                {/* The Unfolded Letter Sheet */}
                <div className="w-full rounded-2xl bg-[#FFFDF9] border border-[#D4AF37]/65 shadow-[0_12px_36px_-6px_rgba(45,30,15,0.18),inset_0_0_30px_rgba(212,175,55,0.06)] p-5 relative overflow-hidden">
                  
                  {/* Watermark Crest */}
                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none font-cinzel text-6xl select-none text-[#8C1D35]">
                    ⚯ ⚡
                  </div>

                  {/* Letter Sheet Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DCB8] mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#8C1D35] text-[#F5E8BE] flex items-center justify-center shadow-xs">
                        <Feather className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[9.5px] text-[#8C7658] font-cinzel tracking-wider block leading-none">
                          霍格沃茨致候密札 · 第 {tapCount} 封
                        </span>
                        <h3 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                          致 我最珍视的{recipientTitle}：
                        </h3>
                      </div>
                    </div>

                    <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[#EADBC4]/70 text-[#8C1D35] border border-[#D9C89E] font-cinzel font-bold">
                      已启封 · UNVEILED
                    </span>
                  </div>

                  {/* ----------------------------------------------------
                      B. QUILL INK SEEPAGE TEXT (羽毛笔墨迹渗透流淌显影)
                  ---------------------------------------------------- */}
                  <div className="my-3 p-4 rounded-xl bg-[#FAF5EB] border border-[#E8DCB8] space-y-2.5 text-center">
                    
                    {/* Line 1 - Ink seep */}
                    <div className="overflow-hidden">
                      <motion.p
                        initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                        animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                        className="text-xs text-[#4A3525] font-serif italic tracking-wide"
                      >
                        {currentLetter.line1}
                      </motion.p>
                    </div>

                    {/* Line 2 - Ink seep */}
                    <div className="overflow-hidden">
                      <motion.p
                        initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                        animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                        transition={{ duration: 1.1, delay: 0.75, ease: 'easeOut' }}
                        className="text-xs text-[#4A3525] font-serif italic tracking-wide font-medium"
                      >
                        {currentLetter.line2}
                      </motion.p>
                    </div>

                    {/* Line 3 - Gold Ink Reveal */}
                    <div className="overflow-hidden pt-1">
                      <motion.div
                        initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                        animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                        transition={{ duration: 1.2, delay: 1.5, ease: 'easeOut' }}
                        className="text-[11.5px] text-[#8C1D35] font-serif font-semibold drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
                      >
                        {currentLetter.signature}
                      </motion.div>
                    </div>
                  </div>

                  {/* ----------------------------------------------------
                      C. DYNAMIC ATTACHED POSTSCRIPT NOTES (密札附签印信)
                      Real physical postscripts affixed to the letter
                  ---------------------------------------------------- */}
                  <AnimatePresence>
                    {activeWhispers.map((w, idx) => (
                      <motion.div
                        key={`${w}-${idx}`}
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="my-2.5 p-3 rounded-xl bg-[#FAF5EB] border border-[#D4AF37]/50 shadow-2xs relative overflow-hidden text-left"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-[#E8DCB8]/60 mb-1">
                          <span className="text-[9px] font-cinzel text-[#8C1D35] font-bold tracking-wider flex items-center gap-1">
                            <Feather className="w-2.5 h-2.5 text-[#C5A059]" />
                            POSTSCRIPT · 密札附签 {idx === 0 ? '· 最新封入' : ''}
                          </span>
                          <span className="text-[8.5px] font-serif text-[#8C7658] italic">
                            ⚜️ 已加盖火漆印信
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#2C241E] font-serif italic leading-relaxed">
                          “{w}”
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* ----------------------------------------------------
                      D. INTERACTIVE WHISPER INPUT BOX (带弹弓发射的私语框)
                  ---------------------------------------------------- */}
                  <div className="my-2.5 p-2.5 rounded-xl bg-[#FAF6EE] border border-[#D9C89E]/60">
                    <label className="block text-[9.5px] font-cinzel text-[#8C7658] mb-1 min-h-[16px] flex items-center justify-between">
                      <span>ATTACH A SECRET WHISPER · 附添私密心语</span>
                      {justSent && (
                        <motion.span
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-[#8C1D35] font-serif text-[9px] font-bold"
                        >
                          已加盖火漆附入密札 ✨
                        </motion.span>
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={whisper}
                        onChange={(e) => setWhisper(e.target.value)}
                        placeholder={
                          justSent
                            ? "附言已封存，可续写下一句心事..."
                            : "写下一句此刻心事... (可按住拉弓弹射)"
                        }
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#D9C89E] bg-[#FFFDF9] focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-[#2C241E] font-serif placeholder:text-[#A8987E] transition-colors"
                        maxLength={50}
                      />
                      {/* React Bits SlingButton */}
                      <SlingButton
                        onSend={handleSendWhisper}
                        disabled={!whisper.trim()}
                        padColor="#8C1D35"
                        iconColor="#FFFDF5"
                        accentColor="#D4AF37"
                        wellColor="#EADBC4"
                        bandColor="#7A6750"
                        size={40}
                        strokeWidth={2.5}
                        armAt={34}
                        maxPull={100}
                        launchSpeed={2600}
                        recoil={0.25}
                        flight={140}
                        particles={16}
                        spread={60}
                        tapSends={true}
                        ariaLabel="发送私语"
                      >
                        <Bird className="w-4.5 h-4.5" />
                      </SlingButton>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleCompleteBreak}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#A51D38] to-[#7D122B] text-[#F5EBD9] text-[11px] font-cinzel tracking-wider flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 transition-all border border-[#D4AF37]/40 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#F5E8BE]" />
                      重燃心动共鸣 ({tapCount})
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-3.5 py-2 rounded-xl bg-[#EADBC4]/50 hover:bg-[#EADBC4] text-[#7A6750] text-[11px] font-serif transition-colors border border-[#D9C89E]/60 flex items-center gap-1 cursor-pointer"
                      title="信件滑回信封重封"
                    >
                      <Lock className="w-3 h-3" />
                      封存密札 · LOCK
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* --------------------------------------------------------
                  B. THE SEALED STATE: Real Folded Envelope with Wax Seal
              -------------------------------------------------------- */
              <motion.div
                key="sealed-flap-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full flex flex-col items-center justify-center py-4 relative z-20"
              >
                {/* Envelope Flap Fold Seam lines (Forming authentic envelope flap) */}
                <div className="absolute inset-0 pointer-events-none opacity-45 flex items-center justify-center">
                  <svg viewBox="0 0 320 200" className="w-full h-full">
                    <line x1="0" y1="0" x2="160" y2="105" stroke="#C5A059" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="320" y1="0" x2="160" y2="105" stroke="#C5A059" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="200" x2="160" y2="105" stroke="#C5A059" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="320" y1="200" x2="160" y2="105" stroke="#C5A059" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                </div>

                {/* Velvet Silk Ribbon running horizontally under the wax seal */}
                <div className="relative w-full my-6 flex items-center justify-center">
                  <div className="absolute left-[-20px] right-[-20px] h-9 bg-gradient-to-r from-[#520B1C] via-[#8C1D35] to-[#520B1C] shadow-md flex items-center justify-between px-5 border-y border-[#D4AF37]/50">
                    <span className="text-[8px] font-cinzel tracking-[0.25em] text-[#F5E8BE]/75">
                      · ALWAYS AND FOREVER ·
                    </span>
                    <span className="text-[8px] font-cinzel tracking-[0.25em] text-[#F5E8BE]/75">
                      · LUMOS AMORIS ·
                    </span>
                  </div>

                  {/* The Central Wax Seal with Hold-to-Break Hexagram Ritual */}
                  <div className="relative flex items-center justify-center p-5 z-20">
                      
                      {/* 1. Ancient Concentric Runic Magic Circle */}
                      <div
                        className={`absolute inset-[-18px] pointer-events-none flex items-center justify-center transition-all duration-300 ${
                          isHolding ? 'scale-105 opacity-95' : 'scale-100 opacity-60'
                        }`}
                        style={{ transform: 'translateZ(0)' }}
                      >
                        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin" style={{ animationDuration: '24s' }}>
                          <defs>
                            <radialGradient id="magicRuneGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="60%" stopColor="#D4AF37" stopOpacity={isHolding ? '0.85' : '0.4'} />
                              <stop offset="90%" stopColor="#FFF8DE" stopOpacity={isHolding ? '1' : '0.6'} />
                              <stop offset="100%" stopColor="#FFE599" stopOpacity="0" />
                            </radialGradient>
                          </defs>

                          <circle cx="100" cy="100" r="94" fill="none" stroke="url(#magicRuneGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
                          <circle cx="100" cy="100" r="88" fill="none" stroke="#D4AF37" strokeWidth="1.2" opacity={isHolding ? 0.9 : 0.65} />
                          <circle cx="100" cy="100" r="52" fill="none" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="2 4" opacity={isHolding ? 0.85 : 0.5} />

                          {/* Distinct Sacred Hexagram */}
                          <g>
                            <polygon
                              points="100,14 174,142 26,142"
                              fill={isHolding ? 'rgba(212, 175, 55, 0.08)' : 'none'}
                              stroke={isHolding ? '#FFF8DE' : '#C5A059'}
                              strokeWidth={isHolding ? '1.8' : '1.3'}
                              opacity={isHolding ? 1 : 0.8}
                            />
                            <polygon
                              points="100,186 174,58 26,58"
                              fill={isHolding ? 'rgba(212, 175, 55, 0.08)' : 'none'}
                              stroke={isHolding ? '#FFF8DE' : '#C5A059'}
                              strokeWidth={isHolding ? '1.8' : '1.3'}
                              opacity={isHolding ? 1 : 0.8}
                            />
                          </g>

                          {/* 6 Luminous Astrological Star Nodes */}
                          {[
                            { cx: 100, cy: 14 },
                            { cx: 174, cy: 58 },
                            { cx: 174, cy: 142 },
                            { cx: 100, cy: 186 },
                            { cx: 26, cy: 142 },
                            { cx: 26, cy: 58 }
                          ].map((pt, i) => (
                            <g key={i}>
                              <circle cx={pt.cx} cy={pt.cy} r={isHolding ? 3.5 : 2.5} fill="#D4AF37" />
                              <circle cx={pt.cx} cy={pt.cy} r={isHolding ? 1.8 : 1.2} fill="#FFFDF5" />
                            </g>
                          ))}

                          <line x1="100" y1="4" x2="100" y2="196" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="4 6" opacity={isHolding ? 0.75 : 0.4} />
                          <line x1="4" y1="100" x2="196" y2="100" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="4 6" opacity={isHolding ? 0.75 : 0.4} />
                        </svg>
                      </div>

                      {/* 2. Rotating Latin Inscription Dial */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-105">
                        <CircularText
                          text="· LUMOS AMORIS · ALWAYS · I MISS YOU · "
                          spinDuration={24}
                        />
                      </div>

                      {/* 3. Incandescent Blazing Molten Ring */}
                      {isHolding && (
                        <svg
                          className="absolute w-[184px] h-[184px] pointer-events-none z-30 rotate-[-90deg]"
                          viewBox="0 0 160 160"
                        >
                          <circle
                            stroke="rgba(212, 175, 55, 0.25)"
                            fill="transparent"
                            strokeWidth={strokeWidth}
                            r={normalizedRadius}
                            cx={sealRadius}
                            cy={sealRadius}
                          />
                          <circle
                            stroke="#FFF8DE"
                            fill="transparent"
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${circumference} ${circumference}`}
                            style={{ strokeDashoffset }}
                            strokeLinecap="round"
                            r={normalizedRadius}
                            cx={sealRadius}
                            cy={sealRadius}
                          />
                        </svg>
                      )}

                      {/* 4. Central Wax Seal Button */}
                      <motion.button
                        onMouseDown={handleStartHold}
                        onMouseUp={handleEndHold}
                        onMouseLeave={handleEndHold}
                        onTouchStart={handleStartHold}
                        onTouchEnd={handleEndHold}
                        onTouchCancel={handleEndHold}
                        onContextMenu={(e) => e.preventDefault()}
                        whileTap={{ scale: 0.96 }}
                        animate={{
                          scale: isHolding ? 1.05 : 1,
                          boxShadow: isHolding
                            ? `0 0 28px rgba(212, 175, 55, 0.8), inset 0 0 16px rgba(255, 242, 206, 0.7)`
                            : '0 16px 36px -4px rgba(107, 18, 38, 0.45)'
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                        className="relative w-[138px] h-[138px] rounded-full aspect-square flex flex-col items-center justify-center focus:outline-none cursor-pointer wax-seal-shadow group select-none"
                        style={{
                          background: 'radial-gradient(circle at 36% 36%, #A51D38 0%, #7D122B 55%, #4C0816 100%)',
                          transform: 'translateZ(0)',
                          touchAction: 'none',
                          WebkitUserSelect: 'none',
                          userSelect: 'none'
                        }}
                      >
                        <div className="absolute inset-1 rounded-full border border-[#D4AF37]/50 pointer-events-none" />
                        <div className="absolute inset-2.5 rounded-full border border-[#D4AF37]/25 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                          <Heart
                            className={`w-11 h-11 fill-[#F5E8BE] text-[#C5A059] transition-all duration-200 ${
                              isHolding
                                ? 'scale-115 text-[#FFFFFF]'
                                : 'group-hover:scale-110'
                            }`}
                          />
                          <span className="font-cinzel text-[11px] font-bold tracking-[0.2em] mt-1 text-[#F5E8BE]">
                            ALWAYS
                          </span>
                          <span className="font-serif text-[8.5px] tracking-wider text-[#E8C68A]/80 -mt-0.5">
                            LUMOS
                          </span>
                        </div>
                      </motion.button>

                      {/* Lumos Maxima Light Shockwave on Completion */}
                      {showShockwave && (
                        <motion.div
                          initial={{ scale: 0.6, opacity: 1 }}
                          animate={{ scale: 2.8, opacity: 0 }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="absolute inset-0 rounded-full border-4 border-[#FFF8DE] shadow-[0_0_30px_#D4AF37] pointer-events-none z-50"
                        />
                      )}
                    </div>
                </div>

                {/* Subtitle Hint */}
                <div className="text-center mt-1">
                  <p className="text-xs text-[#7A6750] font-serif">
                    长按火漆封印 · 以心火融蜡启封密信
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Envelope Footer Action Bar */}
        <div className="p-4 pt-2.5 border-t border-[#D9C89E]/40 flex items-center justify-between bg-[#FCF8F0]/60 relative z-20">
          <div className="min-h-[20px] flex items-center">
            {!isOpen ? (
              isHolding ? (
                <div className="flex items-center gap-1.5 text-xs text-[#8C1D35] font-serif font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                  <span>魔咒蓄能融蜡中 ({holdProgress}%)... 保持触碰</span>
                </div>
              ) : (
                <p className="text-xs text-[#7A6750] font-serif flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>封缄状态 · 霍格莫德特快直递</span>
                </p>
              )
            ) : (
              <p className="text-xs text-[#8C1D35] font-serif flex items-center gap-1">
                <Feather className="w-3 h-3 text-[#C5A059]" />
                <span>羽毛笔墨迹渗透显影 · 展信舒颜</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EADBC4]/70 border border-[#D9C89E] text-[#8C1D35] font-cinzel tracking-wider">
              {isOpen ? 'UNVEILED' : 'LUMOS · 荧光启封'}
            </span>
            <span className="text-[10px] text-[#8C7658] font-cinzel">
              思念共鸣 × {tapCount}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Time-Turner Apparatus (时间转换器 · 回溯往日信笺) */}
      <TimeTurner />
    </div>
  );
};
