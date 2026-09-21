import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Zap, RotateCcw, HelpCircle, Trophy, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

export const TheMindGame: React.FC = () => {
  const [level, setLevel] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [shurikens, setShurikens] = useState<number>(1);
  const [pile, setPile] = useState<number[]>([]); // played cards stack

  const [handHE, setHandHE] = useState<number[]>([]);
  const [handHER, setHandHER] = useState<number[]>([]);
  
  // Game states: 'syncing' (both place finger to start), 'playing', 'level_clear', 'game_over'
  const [gameState, setGameState] = useState<'syncing' | 'playing' | 'level_clear' | 'game_over'>('syncing');
  const [heSynced, setHeSynced] = useState(false);
  const [herSynced, setHerSynced] = useState(false);

  const [lastMistake, setLastMistake] = useState<{ played: number; missed: number; whoMissed: 'HE' | 'HER' } | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [log, setLog] = useState<string>('双手触碰水晶，静心同频后开始...');

  // Start / Deal for a specific level
  const dealLevel = (lvl: number) => {
    // Pick unique numbers from 1 to 100
    const pool = Array.from({ length: 100 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const count = lvl; // Level 1 = 1 card each, Level 2 = 2 each, etc.

    const heCards = pool.slice(0, count).sort((a, b) => a - b);
    const herCards = pool.slice(count, count * 2).sort((a, b) => a - b);

    setHandHE(heCards);
    setHandHER(herCards);
    setPile([]);
    setLastMistake(null);
    setHeSynced(false);
    setHerSynced(false);
    setGameState('syncing');
    setLog(`第 ${lvl} 阶：每人手握 ${lvl} 张星轨卡。请双手静心触碰水晶！`);
  };

  // Initial deal
  useEffect(() => {
    dealLevel(1);
    setLives(3);
    setShurikens(1);
  }, []);

  // When both sync, start playing
  useEffect(() => {
    if (gameState === 'syncing' && heSynced && herSynced) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([20, 30, 60]);
        } catch {}
      }
      setTimeout(() => {
        setGameState('playing');
        setLog('✦ 同频开启 ✦ 保持静默，按直觉从小到大打出手牌！');
      }, 500);
    }
  }, [heSynced, herSynced, gameState]);

  // Handle Play Card
  const handlePlayCard = (player: 'HE' | 'HER', cardVal: number) => {
    if (gameState !== 'playing') return;

    // Check if other player had a SMALLER card!
    const otherHand = player === 'HE' ? handHER : handHE;
    const missedSmaller = otherHand.filter((c) => c < cardVal);

    if (missedSmaller.length > 0) {
      // MISTAKE! Someone held a smaller card!
      const lowestMissed = missedSmaller[0];
      const nextLives = lives - 1;
      setLives(nextLives);

      setLastMistake({
        played: cardVal,
        missed: lowestMissed,
        whoMissed: player === 'HE' ? 'HER' : 'HE'
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([80, 50, 120]);
        } catch {}
      }

      // Discard all cards smaller than cardVal from both hands
      const newHandHE = handHE.filter((c) => c > cardVal && c !== cardVal);
      const newHandHER = handHER.filter((c) => c > cardVal && c !== cardVal);
      const newPile = [...pile, lowestMissed, cardVal];

      setPile(newPile);
      setHandHE(newHandHE);
      setHandHER(newHandHER);

      if (nextLives <= 0) {
        setGameState('game_over');
        setLog(`💔 生命耗尽！${player === 'HE' ? 'HER' : 'HE'} 手里握着更小的 ${lowestMissed}，但打出了 ${cardVal}。`);
        return;
      } else {
        setLog(`⚠️ 灵犀微错！${player === 'HE' ? 'HER' : 'HE'} 手中握着 ${lowestMissed} 尚未打出！已自动补正。`);
      }

      // Check if that mistake cleared remaining cards
      if (newHandHE.length === 0 && newHandHER.length === 0) {
        handleLevelComplete();
      }
    } else {
      // SUCCESSFUL PLAY!
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([25]);
        } catch {}
      }

      const nextPile = [...pile, cardVal];
      setPile(nextPile);

      const nextHandHE = player === 'HE' ? handHE.filter((c) => c !== cardVal) : handHE;
      const nextHandHER = player === 'HER' ? handHER.filter((c) => c !== cardVal) : handHER;

      setHandHE(nextHandHE);
      setHandHER(nextHandHER);
      setLastMistake(null);
      setLog(`✨ ${player === 'HE' ? 'HE' : 'HER'} 顺位打出 [${cardVal}]，节奏完美！`);

      // Check level clear
      if (nextHandHE.length === 0 && nextHandHER.length === 0) {
        handleLevelComplete();
      }
    }
  };

  const handleLevelComplete = () => {
    setGameState('level_clear');
    confetti({
      particleCount: 70,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FFE599', '#D4AF37', '#8C1D35', '#60A5FA']
    });

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 40, 90, 120]);
      } catch {}
    }

    setLog(`🎉 第 ${level} 阶心灵同频达成！你们的心跳完美共振！`);
  };

  const nextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    // Reward bonus life on level 3
    if (nextLvl === 3) {
      setLives((l) => Math.min(l + 1, 5));
    }
    // Reward shuriken on level 2
    if (nextLvl === 2) {
      setShurikens((s) => s + 1);
    }
    dealLevel(nextLvl);
  };

  const restartAll = () => {
    setLevel(1);
    setLives(3);
    setShurikens(1);
    dealLevel(1);
  };

  // Shuriken ability: both discard their lowest card
  const handleUseShuriken = () => {
    if (shurikens <= 0 || gameState !== 'playing') return;
    setShurikens((s) => s - 1);

    const lowestHE = handHE[0];
    const lowestHER = handHER[0];
    const discards: number[] = [];

    let nextHE = [...handHE];
    let nextHER = [...handHER];

    if (lowestHE !== undefined) {
      discards.push(lowestHE);
      nextHE = nextHE.slice(1);
    }
    if (lowestHER !== undefined) {
      discards.push(lowestHER);
      nextHER = nextHER.slice(1);
    }

    setPile((p) => [...p, ...discards.sort((a, b) => a - b)]);
    setHandHE(nextHE);
    setHandHER(nextHER);

    setLog(`⚡ 灵光一闪！双方各自亮出并弃置了手中最小牌：${discards.join(', ')}`);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 80]);
      } catch {}
    }

    if (nextHE.length === 0 && nextHER.length === 0) {
      handleLevelComplete();
    }
  };

  const topCard = pile[pile.length - 1];

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-5 font-serif select-none">
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-4 sm:p-5 text-[#2C241E] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9C89E]/60 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-[#3B82F6] border-2 border-[#D4AF37] text-[#FFE599] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-[#93C5FD] filter drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.25em] text-[#8C7658] font-bold block leading-none">
                  THE MIND · 心灵同步
                </span>
                <span className="text-[8px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#3B82F6]/20 to-[#8C1D35]/15 text-[#1E3A8A] font-cinzel font-bold border border-[#3B82F6]/40 shadow-2xs">
                  BGG 全球双人合作 TOP 1
                </span>
              </div>
              <h2 className="text-sm font-bold text-[#2C241E] font-serif mt-0.5">
                绝对静默 · 凭心跳节奏打出星轨卡
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowRules(true)}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-b from-[#FAF5EB] to-[#F0E4D0] text-[#1E3A8A] border border-[#D4AF37]/60 text-[10px] font-bold font-serif flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>规则</span>
            </button>
            <button
              onClick={restartAll}
              className="p-1.5 rounded-xl bg-gradient-to-b from-[#FAF5EB] to-[#F0E4D0] text-[#8C7658] hover:text-[#8C1D35] border border-[#D9C89E]/70 transition-all cursor-pointer shadow-2xs"
              title="重新开始"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* HUD: Level, Lives, Shuriken */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FAF5EB] via-[#FFFDF9] to-[#FAF5EB] border-2 border-[#D4AF37]/45 mb-3 text-xs font-cinzel shadow-xs">
          {/* Level */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#8C7658] font-bold">LEVEL:</span>
            <span className="font-bold text-sm text-[#8C1D35] px-2 py-0.5 rounded-lg bg-[#8C1D35]/10 border border-[#8C1D35]/20">
              第 {level} 阶
            </span>
          </div>

          {/* Shuriken */}
          <button
            onClick={handleUseShuriken}
            disabled={shurikens <= 0 || gameState !== 'playing'}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-serif font-bold flex items-center gap-1 border transition-all cursor-pointer shadow-2xs ${
              shurikens > 0 && gameState === 'playing'
                ? 'bg-gradient-to-r from-[#1E3A8A] to-[#0F172A] text-[#93C5FD] border-[#60A5FA]'
                : 'bg-[#FAF5EB] text-[#A8987E] border-[#D9C89E]/60 opacity-50'
            }`}
          >
            <Zap className="w-3 h-3 text-[#FDE047]" />
            <span>灵光一闪 ({shurikens})</span>
          </button>

          {/* Lives */}
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].slice(0, Math.max(3, lives)).map((i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 filter drop-shadow-2xs ${
                    i < lives ? 'text-[#8C1D35] fill-current animate-pulse' : 'text-[#D9C89E]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tactical Narrative Bar */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-[#FAF6EE] to-[#FFFDF9] border border-[#D9C89E]/70 mb-3 text-[11px] font-serif text-[#524336] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-1.5 flex-1 pr-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span className="font-bold leading-tight">{log}</span>
          </div>
        </div>

        {/* Mistake Alert Banner */}
        {lastMistake && (
          <div className="p-2 rounded-xl bg-[#7F1D1D]/15 border border-[#EF4444]/40 text-[#B91C1C] text-[10.5px] font-serif mb-3 flex items-center justify-between">
            <span>
              ⚠️ 节奏偏差：出牌 [{lastMistake.played}] 时，{lastMistake.whoMissed} 手中尚有较小牌 [{lastMistake.missed}]
            </span>
          </div>
        )}

        {/* ========================================================
            TOP ZONE: HER (Player 2)
        ======================================================== */}
        <div className="p-3 rounded-2xl bg-gradient-to-b from-[#182638] to-[#0F172A] border-2 border-[#D4AF37]/50 text-[#FFFDF5] mb-3 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-cinzel text-[#93C5FD] mb-2">
            <span className="font-bold flex items-center gap-1">
              👧 HER 的星轨手牌 ({handHER.length} 张)：
            </span>
            <span className="text-[9px] text-[#A8987E] italic">
              （按直觉从小到大打出）
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 py-1 overflow-x-auto">
            {handHER.map((cardVal) => (
              <motion.button
                key={`her-${cardVal}`}
                whileTap={{ scale: 0.92 }}
                whileHover={{ y: -2 }}
                disabled={gameState !== 'playing'}
                onClick={() => handlePlayCard('HER', cardVal)}
                className="w-14 h-20 rounded-xl bg-gradient-to-b from-[#1E3A8A] via-[#1E40AF] to-[#0F172A] border-2 border-[#60A5FA] text-[#FFFDF5] shadow-lg flex flex-col items-center justify-between p-1.5 cursor-pointer relative group"
              >
                <span className="text-[9px] font-cinzel font-bold text-[#93C5FD]">HER</span>
                <span className="text-xl font-bold font-mono text-[#FDE047] drop-shadow-xs">
                  {cardVal}
                </span>
                <span className="text-[8px] bg-black/40 px-1 rounded text-[#93C5FD]">打出 👆</span>
              </motion.button>
            ))}

            {handHER.length === 0 && (
              <span className="text-xs text-[#93C5FD]/60 italic py-5 font-serif">
                ✨ 手牌已全部清空，等待同频结案！
              </span>
            )}
          </div>
        </div>

        {/* ========================================================
            CENTER ALTAR: SACRED RESONANCE CORE (中央光阵)
        ======================================================== */}
        <div className="relative py-4 my-2 flex items-center justify-center">
          {/* Rotating Arcane Ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full border border-dashed border-[#D4AF37]/40 animate-[spin_24s_linear_infinite]" />
            <div className="w-24 h-24 rounded-full border border-[#D4AF37]/25 animate-[spin_12s_linear_infinite_reverse]" />
          </div>

          {/* Center Card Pile */}
          <div className="relative z-10 flex flex-col items-center">
            {topCard ? (
              <motion.div
                key={topCard}
                initial={{ scale: 0.7, y: -10, rotate: -6 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                className="w-20 h-28 rounded-2xl bg-gradient-to-b from-[#FFFDF9] via-[#F5EBD9] to-[#EAE0CD] border-3 border-[#D4AF37] shadow-2xl flex flex-col items-center justify-between p-2"
              >
                <div className="w-full flex items-center justify-between text-[9px] font-cinzel text-[#8C7658] font-bold">
                  <span>ORBIT</span>
                  <span>⚜️</span>
                </div>
                <div className="text-3xl font-extrabold font-mono text-[#8C1D35] drop-shadow-xs">
                  {topCard}
                </div>
                <div className="text-[8.5px] font-serif text-[#8C7658] text-center leading-none">
                  当前星轨顶牌
                </div>
              </motion.div>
            ) : (
              <div className="w-20 h-28 rounded-2xl border-2 border-dashed border-[#D4AF37]/60 bg-[#FAF5EB]/50 flex flex-col items-center justify-center p-2 text-center text-[#A8987E]">
                <Flame className="w-6 h-6 text-[#D4AF37] animate-pulse mb-1" />
                <span className="text-[10px] font-serif">静默光阵待命</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            SYNC INTERACTION OVERLAY (双手触碰静心同频)
        ======================================================== */}
        {gameState === 'syncing' && (
          <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#0F172A] border-2 border-[#D4AF37] text-center text-[#FFFDF5] space-y-2.5 shadow-xl">
            <h4 className="text-xs font-cinzel font-bold text-[#FFE599]">
              ✦ 双手静心同频仪式 · 禁止交谈 ✦
            </h4>
            <p className="text-[10.5px] text-[#93C5FD] font-serif">
              请两人同时各点亮下方的“心念按键”，校准彼此时间感知后正式开局！
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setHeSynced(true)}
                className={`py-2 rounded-xl text-xs font-serif font-bold transition-all border cursor-pointer ${
                  heSynced
                    ? 'bg-[#166534] text-[#86EFAC] border-[#4ADE80] shadow-md'
                    : 'bg-[#1E293B] text-[#FFFDF5] border-[#D4AF37]/50 hover:bg-[#334155]'
                }`}
              >
                {heSynced ? '✓ HE 已同频' : '👦 HE 触碰同频'}
              </button>
              <button
                onClick={() => setHerSynced(true)}
                className={`py-2 rounded-xl text-xs font-serif font-bold transition-all border cursor-pointer ${
                  herSynced
                    ? 'bg-[#166534] text-[#86EFAC] border-[#4ADE80] shadow-md'
                    : 'bg-[#1E293B] text-[#FFFDF5] border-[#D4AF37]/50 hover:bg-[#334155]'
                }`}
              >
                {herSynced ? '✓ HER 已同频' : '👧 HER 触碰同频'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            BOTTOM ZONE: HE (Player 1)
        ======================================================== */}
        <div className="p-3 rounded-2xl bg-gradient-to-b from-[#2C181D] to-[#1A0A0E] border-2 border-[#D4AF37]/50 text-[#FFFDF5] shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-cinzel text-[#FCA5A5] mb-2">
            <span className="font-bold flex items-center gap-1">
              👦 HE 的星轨手牌 ({handHE.length} 张)：
            </span>
            <span className="text-[9px] text-[#A8987E] italic">
              （按直觉从小到大打出）
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 py-1 overflow-x-auto">
            {handHE.map((cardVal) => (
              <motion.button
                key={`he-${cardVal}`}
                whileTap={{ scale: 0.92 }}
                whileHover={{ y: -2 }}
                disabled={gameState !== 'playing'}
                onClick={() => handlePlayCard('HE', cardVal)}
                className="w-14 h-20 rounded-xl bg-gradient-to-b from-[#8C1D35] via-[#6B1226] to-[#450A0A] border-2 border-[#FF8080] text-[#FFFDF5] shadow-lg flex flex-col items-center justify-between p-1.5 cursor-pointer relative group"
              >
                <span className="text-[9px] font-cinzel font-bold text-[#FCA5A5]">HE</span>
                <span className="text-xl font-bold font-mono text-[#FFE599] drop-shadow-xs">
                  {cardVal}
                </span>
                <span className="text-[8px] bg-black/40 px-1 rounded text-[#FCA5A5]">打出 👆</span>
              </motion.button>
            ))}

            {handHE.length === 0 && (
              <span className="text-xs text-[#FCA5A5]/60 italic py-5 font-serif">
                ✨ 手牌已全部清空，等待同频结案！
              </span>
            )}
          </div>
        </div>

        {/* Level Clear Modal */}
        {gameState === 'level_clear' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-[#FAF5EB] to-[#FFFDF9] border-2 border-[#D4AF37] text-center space-y-2 shadow-md"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel font-bold text-[#8C1D35]">
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
              <span>第 {level} 阶心灵同频达成！</span>
            </div>
            <p className="text-xs font-serif text-[#2C241E]">
              没有任何言语沟通，你们凭心跳节奏完成了按序出牌！
            </p>
            <div className="pt-1">
              <button
                onClick={nextLevel}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-cinzel font-bold tracking-wider cursor-pointer border border-[#D4AF37]/50 shadow-md"
              >
                晋级第 {level + 1} 阶星轨挑战 ➡️
              </button>
            </div>
          </motion.div>
        )}

        {/* Game Over Modal */}
        {gameState === 'game_over' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-4 rounded-2xl bg-[#2C181D] border-2 border-[#8C1D35] text-center space-y-2 shadow-md text-[#FFFDF5]"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel font-bold text-[#FF8080]">
              <Heart className="w-4 h-4 text-[#FF8080]" />
              <span>灵犀波段失准 · 试炼落幕</span>
            </div>
            <p className="text-xs font-serif text-[#FFD6D6]">
              最高到达第 {level} 阶！输的一方给赢的一方剥一只橘子或揉揉肩 🍊
            </p>
            <div className="pt-1">
              <button
                onClick={restartAll}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-cinzel font-bold tracking-wider cursor-pointer border border-[#D4AF37]/50 shadow-md"
              >
                重新开局挑战 🔄
              </button>
            </div>
          </motion.div>
        )}

        {/* Rules Modal */}
        <AnimatePresence>
          {showRules && (
            <div className="fixed inset-0 z-50 bg-[#111A27]/70 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="w-full max-w-sm rounded-3xl p-5 bg-[#FCF9F2] shadow-2xl border-2 border-[#D4AF37]/60 text-[#2C241E] space-y-3 relative font-serif"
              >
                <div className="flex items-center justify-between border-b border-[#D9C89E]/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <h3 className="text-xs font-bold font-cinzel tracking-wider text-[#8C1D35]">
                      THE MIND · 心灵同步秘典
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowRules(false)}
                    className="w-6 h-6 rounded-full bg-[#FAF5EB] text-[#8C7658] hover:text-[#8C1D35] flex items-center justify-center border border-[#D9C89E] text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-[11px] text-[#524336] leading-relaxed">
                  <p>
                    <strong>1. 目标</strong>：两人齐心协力，将手中的数字卡（1~100）<strong>按从小到大的升序</strong>依次打入中央光阵。
                  </p>
                  <p>
                    <strong>2. 绝对法则</strong>：<strong>全场禁止交谈！禁止报数字！</strong> 只能看着对方眼睛，凭感觉感受时间的流动。牌小（如 5、12）的人应该早点出，牌大（如 78、95）的人要耐心等待。
                  </p>
                  <p>
                    <strong>3. 错误惩罚</strong>：如果有人打出了 42，但另一人手里其实握着更小的 35，则失去 1 点生命值，同时自动弃掉所有比 42 小的牌。
                  </p>
                  <p>
                    <strong>4. 灵光一闪</strong>：遇到僵局时可消耗飞镖，双方自动亮出并弃掉手中最小的一张牌，化解危机！
                  </p>
                </div>

                <button
                  onClick={() => setShowRules(false)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-cinzel font-bold tracking-wider cursor-pointer border border-[#D4AF37]/50 shadow-xs"
                >
                  合上秘典 · 开始同频
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
