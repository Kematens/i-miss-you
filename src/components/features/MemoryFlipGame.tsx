import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, HelpCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CardItem {
  id: number;
  word: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const COUPLE_PAIRS = [
  '奶茶 🧋',
  '火锅 🍲',
  '看电影 🎬',
  '牵手 🤝',
  '拥抱 🫂',
  '做饭 🍳',
  '冰淇淋 🍦',
  '游乐园 🎡'
];

export const MemoryFlipGame: React.FC = () => {
  const initGame = () => {
    // 8 pairs -> 16 cards
    const deck: CardItem[] = [];
    let idCounter = 1;

    COUPLE_PAIRS.forEach((word) => {
      deck.push({ id: idCounter++, word, isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, word, isFlipped: false, isMatched: false });
    });

    return deck.sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState<CardItem[]>(initGame);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [turn, setTurn] = useState<'A' | 'B'>('A'); // Player A (HE), Player B (HER)
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [showRule, setShowRule] = useState(false);

  const handleCardClick = (id: number) => {
    if (isBusy) return;
    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip card
    const nextFlipped = [...flippedIds, id];
    setFlippedIds(nextFlipped);

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }

    // When 2 cards are flipped
    if (nextFlipped.length === 2) {
      setIsBusy(true);
      const [firstId, secondId] = nextFlipped;
      const card1 = cards.find((c) => c.id === firstId)!;
      const card2 = clickedCard;

      if (card1.word === card2.word) {
        // MATCH SUCCESS!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );

          if (turn === 'A') setScoreA((s) => s + 1);
          else setScoreB((s) => s + 1);

          setFlippedIds([]);
          setIsBusy(false);

          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate([25, 40]);
            } catch {}
          }

          // Check all matched
          const remainingUnmatched = cards.filter(
            (c) => !c.isMatched && c.id !== firstId && c.id !== secondId
          ).length;

          if (remainingUnmatched === 0) {
            confetti({ particleCount: 50, spread: 80, origin: { y: 0.5 } });
          }
        }, 600);
      } else {
        // MISMATCH -> Flip back and switch turn
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedIds([]);
          setTurn((t) => (t === 'A' ? 'B' : 'A'));
          setIsBusy(false);
        }, 900);
      }
    }
  };

  const resetGame = () => {
    setCards(initGame());
    setFlippedIds([]);
    setTurn('A');
    setScoreA(0);
    setScoreB(0);
    setIsBusy(false);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([10]);
      } catch {}
    }
  };

  const isGameOver = cards.every((c) => c.isMatched);

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-5 font-serif select-none">
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-4 sm:p-5 text-[#2C241E] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9C89E]/60 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/40 text-[#F5E8BE] flex items-center justify-center shadow-xs text-base">
              🎴
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                  MEMORY FLIP · 记忆翻牌
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#8C1D35] font-cinzel border border-[#D4AF37]/30">
                  0 门槛秒上手
                </span>
              </div>
              <h2 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                情侣心动对对碰 · 翻出两张一样即得分
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowRule(true)}
              className="px-2 py-1 rounded-xl bg-[#FAF5EB] text-[#8C1D35] hover:bg-[#EADBC4] border border-[#D4AF37]/50 text-[10px] font-bold font-serif flex items-center gap-1 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>规则</span>
            </button>
            <button
              onClick={resetGame}
              className="p-1.5 rounded-xl bg-[#FAF5EB] text-[#8C7658] hover:text-[#8C1D35] hover:bg-[#EADBC4] border border-[#D9C89E]/70 transition-colors cursor-pointer"
              title="重新洗牌"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Score Board */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF5EB] border border-[#D9C89E]/60 mb-3 text-xs font-cinzel">
          <div className={`flex items-center gap-1.5 ${turn === 'A' ? 'font-bold text-[#8C1D35] scale-105' : 'opacity-50'} transition-all`}>
            <span className="w-2 h-2 rounded-full bg-[#8C1D35]" />
            <span>HE: {scoreA} 对</span>
          </div>

          <span className="text-[10.5px] font-bold text-[#C5A059] bg-[#FFFDF5] px-2 py-0.5 rounded-full border border-[#D4AF37]/40 shadow-2xs">
            {turn === 'A' ? '轮到 HE 翻两张' : '轮到 HER 翻两张'}
          </span>

          <div className={`flex items-center gap-1.5 ${turn === 'B' ? 'font-bold text-[#8C1D35] scale-105' : 'opacity-50'} transition-all`}>
            <span>HER: {scoreB} 对</span>
            <span className="w-2 h-2 rounded-full bg-[#8C1D35]" />
          </div>
        </div>

        {/* 4x4 Cards Matrix */}
        <div className="grid grid-cols-4 gap-2.5 bg-[#EFE7D5] p-3 rounded-2xl border-2 border-[#D4AF37]/45 shadow-inner">
          {cards.map((c) => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleCardClick(c.id)}
              disabled={c.isFlipped || c.isMatched || isBusy}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 text-center font-serif text-xs transition-all border-2 relative cursor-pointer shadow-sm ${
                c.isMatched
                  ? 'bg-gradient-to-br from-[#14532D] to-[#052E16] text-[#86EFAC] border-[#4ADE80] shadow-md'
                  : c.isFlipped
                  ? 'bg-gradient-to-b from-[#FFFDF9] to-[#F5EBD9] text-[#8C1D35] font-bold border-[#D4AF37] shadow-lg ring-2 ring-[#FFE599]/60'
                  : 'bg-gradient-to-b from-[#8C1D35] via-[#6B1226] to-[#4A0E17] text-[#FFE599] border-[#D4AF37] hover:brightness-110 shadow-md'
              }`}
            >
              {c.isFlipped || c.isMatched ? (
                <motion.div
                  initial={{ rotateY: 90, scale: 0.8 }}
                  animate={{ rotateY: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex flex-col items-center justify-center"
                >
                  <span className="text-xl sm:text-2xl mb-0.5 filter drop-shadow-xs">
                    {c.word.split(' ')[1] || '✨'}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold leading-none tracking-tight">
                    {c.word.split(' ')[0]}
                  </span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                  <span className="font-cinzel text-lg sm:text-xl text-[#FFE599] drop-shadow-xs">⚜️</span>
                  <span className="text-[7.5px] font-cinzel tracking-widest text-[#FFE599]/70 mt-0.5">FLIP</span>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Game Over Banner */}
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#FAF5EB] to-[#FFFDF9] border border-[#D4AF37] text-center font-serif shadow-xs"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel font-bold text-[#8C1D35]">
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {scoreA > scoreB
                  ? '对弈结案：HE 拔得头筹！'
                  : scoreB > scoreA
                  ? '对弈结案：HER 记忆力超群大获全胜！'
                  : '平分秋色 · 灵犀并肩！'}
              </span>
            </div>
            <p className="text-[10px] text-[#8C7658] mt-0.5 italic">
              输的一方给赢的一方剥一只虾或揉肩 5 分钟 💆
            </p>
          </motion.div>
        )}

        {/* Rule Modal */}
        <AnimatePresence>
          {showRule && (
            <div className="fixed inset-0 z-50 bg-[#111A27]/80 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="w-full max-w-sm rounded-3xl p-5 bg-[#FCF9F2] shadow-2xl border-2 border-[#D4AF37]/60 text-[#2C241E] space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-[#D9C89E]/60 pb-2.5">
                  <h3 className="text-xs font-bold font-cinzel text-[#8C1D35]">
                    🎴 记忆翻牌对对碰 · 玩法说明
                  </h3>
                  <button
                    onClick={() => setShowRule(false)}
                    className="w-6 h-6 rounded-full bg-[#FAF5EB] text-[#8C7658] flex items-center justify-center border border-[#D9C89E] text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs leading-relaxed text-[#524336] font-serif">
                  <p>1. 盘面共有 16 张背面朝上的卡牌，两两配对成 8 对日常情侣词汇。</p>
                  <p>2. 两个人轮流操作，每次点击翻开两张卡牌：</p>
                  <p className="pl-3 text-[#166534] font-bold">
                    • 若两张词汇相同：配对成功！得 1 分，卡片保持翻开；
                  </p>
                  <p className="pl-3 text-[#8C1D35]">
                    • 若两张不同：卡片重新翻回背面，换对方继续翻牌。
                  </p>
                  <p>3. 记住已经翻开过的词的位置，全部配对完毕比谁的得分高！</p>
                </div>

                <button
                  onClick={() => setShowRule(false)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-cinzel font-bold cursor-pointer border border-[#D4AF37]/50"
                >
                  我知道了
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
