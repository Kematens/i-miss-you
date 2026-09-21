import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RotateCcw, Sparkles, Skull, CheckCircle2, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WordCard {
  id: number;
  word: string;
  // Side A (Player 1) view: 'agent' = target word, 'bystander' = safe, 'assassin' = dementor game over
  roleA: 'agent' | 'bystander' | 'assassin';
  // Side B (Player 2) view
  roleB: 'agent' | 'bystander' | 'assassin';
  isRevealed: boolean;
  revealedBy?: 'A' | 'B';
}

// 情侣真实生活日常与甜蜜心动词库（通俗易懂、好出题、好联想）
const SWEET_COUPLE_WORDS = [
  '奶茶', '火锅', '看电影', '牵手',
  '晚安吻', '拥抱', '散步', '做饭',
  '毛毯', '下雨天', '听歌', '礼物',
  '拍照', '吃夜宵', '旅行', '游乐园',
  '被窝', '甜品', '猫咪', '吹头发',
  '便利店', '夕阳', '奶芙', '摩天轮'
];

export const CodenamesDuet: React.FC = () => {
  // Generate a 4x4 matrix game
  const initGame = () => {
    // Pick 16 words from common romance pool
    const shuffledWords = [...SWEET_COUPLE_WORDS].sort(() => Math.random() - 0.5).slice(0, 16);

    // Distribution:
    // 5 agents for A, 5 agents for B (with 1 or 2 overlaps)
    // 1 assassin for A, 1 assassin for B
    // rest bystanders
    const cards: WordCard[] = shuffledWords.map((word, idx) => {
      let roleA: 'agent' | 'bystander' | 'assassin' = 'bystander';
      let roleB: 'agent' | 'bystander' | 'assassin' = 'bystander';

      if (idx === 0 || idx === 1 || idx === 2 || idx === 3 || idx === 4) {
        roleA = 'agent';
      } else if (idx === 5) {
        roleA = 'assassin';
      }

      if (idx === 3 || idx === 4 || idx === 6 || idx === 7 || idx === 8) {
        roleB = 'agent';
      } else if (idx === 9) {
        roleB = 'assassin';
      }

      return {
        id: idx,
        word,
        roleA,
        roleB,
        isRevealed: false
      };
    });

    // Shuffle card positions
    return cards.sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState<WordCard[]>(initGame);
  const [currentView, setCurrentView] = useState<'A' | 'B'>('A'); // Player A (HE) or Player B (HER) key viewer
  const [peekSecretKey, setPeekSecretKey] = useState(false);
  const [turnsLeft, setTurnsLeft] = useState(9);
  const [gameOver, setGameOver] = useState<'win' | 'lose_dementor' | 'lose_turns' | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Check victory
  const checkVictory = (currentCards: WordCard[]) => {
    // Both need to reveal all target agents
    const allAgentsAFound = currentCards.filter((c) => c.roleA === 'agent').every((c) => c.isRevealed);
    const allAgentsBFound = currentCards.filter((c) => c.roleB === 'agent').every((c) => c.isRevealed);

    if (allAgentsAFound && allAgentsBFound) {
      setGameOver('win');
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#FFE599', '#D4AF37', '#8C1D35', '#FFFDF5']
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 50, 100, 120]);
        } catch {}
      }
    }
  };

  // Guessing a card
  const handleCardClick = (id: number) => {
    if (gameOver) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.isRevealed) return;

    // Reveal
    const updatedCards = cards.map((c) => (c.id === id ? { ...c, isRevealed: true, revealedBy: currentView } : c));
    setCards(updatedCards);

    // If guessed role in other person's view is assassin -> Lose instantly!
    const targetRole = currentView === 'A' ? card.roleB : card.roleA;

    if (targetRole === 'assassin') {
      setGameOver('lose_dementor');
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 80, 150]);
        } catch {}
      }
      return;
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20]);
      } catch {}
    }

    // Spend turn if bystander or end turn
    if (targetRole === 'bystander') {
      const nextTurns = turnsLeft - 1;
      setTurnsLeft(nextTurns);
      if (nextTurns <= 0) {
        setGameOver('lose_turns');
        return;
      }
    }

    checkVictory(updatedCards);
  };

  const handleNextTurn = () => {
    const nextTurns = turnsLeft - 1;
    setTurnsLeft(nextTurns);
    if (nextTurns <= 0) {
      setGameOver('lose_turns');
      return;
    }
    // Switch active view
    setCurrentView((prev) => (prev === 'A' ? 'B' : 'A'));
    setPeekSecretKey(false);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }
  };

  const handleReset = () => {
    setCards(initGame());
    setTurnsLeft(9);
    setGameOver(null);
    setPeekSecretKey(false);
    setCurrentView('A');

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([10]);
      } catch {}
    }
  };

  // Count remaining agents to find
  const remainingAgents = cards.filter((c) => !c.isRevealed && (c.roleA === 'agent' || c.roleB === 'agent')).length;

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-5 font-serif select-none">
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-4 sm:p-5 text-[#2C241E] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9C89E]/60 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/40 text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-[#FFE599]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                  CODENAMES · 如尼密语
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#8C1D35] font-cinzel border border-[#D4AF37]/30">
                  CO-OP DUET
                </span>
              </div>
              <h2 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                双人合作默契解谜 · 避开摄魂怪
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowRuleModal(true)}
              className="px-2 py-1 rounded-xl bg-[#FAF5EB] text-[#8C1D35] hover:bg-[#EADBC4] border border-[#D4AF37]/50 text-[10px] font-bold font-serif flex items-center gap-1 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>玩法说明</span>
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-[#FAF5EB] text-[#8C7658] hover:text-[#8C1D35] hover:bg-[#EADBC4] border border-[#D9C89E]/70 transition-colors cursor-pointer"
              title="重新洗牌发牌"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Turn HUD & Key Card Peek Control */}
        <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-[#FAF5EB] border border-[#D9C89E]/60 mb-2 text-xs font-cinzel">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#8C7658]">VIEW:</span>
            <span className="font-bold text-[#8C1D35]">
              {currentView === 'A' ? 'HE (出题视角)' : 'HER (出题视角)'}
            </span>
          </div>

          {/* Toggle Secret Key Card Peek */}
          <button
            onClick={() => setPeekSecretKey(!peekSecretKey)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
              peekSecretKey
                ? 'bg-[#8C1D35] text-[#FFFDF5] border-[#D4AF37]'
                : 'bg-[#FCF9F2] text-[#8C7658] border-[#D9C89E] hover:text-[#2C241E]'
            }`}
          >
            {peekSecretKey ? <EyeOff className="w-3 h-3 text-[#FFE599]" /> : <Eye className="w-3 h-3" />}
            <span>{peekSecretKey ? '隐藏密码卡' : '查看我方密码'}</span>
          </button>

          <div className="text-right font-mono">
            <span className="text-[10px] text-[#8C7658] mr-1">TURNS:</span>
            <span className="font-bold text-[#8C1D35]">{turnsLeft}</span>
          </div>
        </div>

        {/* Dynamic Inline Tutorial Tip */}
        <div className="p-2 rounded-xl bg-[#FAF6EE] border border-[#D9C89E]/50 mb-3 text-[10px] text-[#7A6750] flex items-center justify-between">
          <span>
            {peekSecretKey ? (
              <span className="text-[#8C1D35] font-bold">
                私密提示：记住绿色目标词，对她说一个线索（例如“甜蜜 2”），不要让她看屏幕！
              </span>
            ) : (
              <span>
                轮到对方猜词时，在下方 16 个词中点击翻牌；猜完点击右下角【交换出题】。
              </span>
            )}
          </span>
        </div>

        {/* Secret Key Card Map (Visible only when peeking) */}
        <AnimatePresence>
          {peekSecretKey && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-2.5 rounded-2xl bg-[#111A27] text-[#FFFDF5] border border-[#D4AF37]/50 mb-3 overflow-hidden shadow-inner"
            >
              <div className="flex items-center justify-between text-[9.5px] font-cinzel mb-1.5 text-[#C5A059]">
                <span>✦ 只有当前出题人可见的羊皮密码图 ✦</span>
                <span className="text-[#FFE599]">向对方给出 1个线索词 + 数字（如“美食 2”）</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {cards.map((c) => {
                  const role = currentView === 'A' ? c.roleA : c.roleB;
                  return (
                    <div
                      key={`key-${c.id}`}
                      className={`text-center py-1 px-0.5 rounded text-[9.5px] font-serif truncate ${
                        role === 'agent'
                          ? 'bg-[#166534] text-[#86EFAC] font-bold border border-[#86EFAC]/40'
                          : role === 'assassin'
                          ? 'bg-[#7F1D1D] text-[#FCA5A5] font-bold border border-[#FCA5A5]/40'
                          : 'bg-[#1E293B] text-[#94A3B8]'
                      }`}
                    >
                      {c.word}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4x4 Parchment Word Matrix Grid */}
        <div className="grid grid-cols-4 gap-1.5 bg-[#EFE7D5] p-2 rounded-2xl border-2 border-[#D4AF37]/45 shadow-inner">
          {cards.map((card) => {
            const roleForOther = currentView === 'A' ? card.roleB : card.roleA;

            return (
              <motion.button
                key={card.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isRevealed || Boolean(gameOver)}
                className={`aspect-[4/3] rounded-xl p-1 flex flex-col items-center justify-center text-center transition-all relative border ${
                  card.isRevealed
                    ? roleForOther === 'agent'
                      ? 'bg-gradient-to-tr from-[#1B4D3E] to-[#2D6A4F] text-[#D8F3DC] border-[#74C69D] shadow-sm'
                      : roleForOther === 'assassin'
                      ? 'bg-gradient-to-tr from-[#8C1D35] to-[#4A0E17] text-[#FFFDF5] border-[#FF99A8] shadow-md'
                      : 'bg-[#D9C89E]/60 text-[#7A6750] border-[#C5B7A0] opacity-80'
                    : 'bg-[#FCF9F2] text-[#2C241E] border-[#D9C89E] hover:border-[#D4AF37] hover:shadow-xs cursor-pointer'
                }`}
              >
                {/* Revealed status stamp icon */}
                {card.isRevealed ? (
                  roleForOther === 'agent' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#86EFAC] mb-0.5" />
                      <span className="text-[10px] font-bold font-serif leading-tight">{card.word}</span>
                    </>
                  ) : roleForOther === 'assassin' ? (
                    <>
                      <Skull className="w-3.5 h-3.5 text-[#FCA5A5] mb-0.5" />
                      <span className="text-[10px] font-bold font-serif leading-tight">{card.word}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] text-[#8C7658] font-cinzel">BYSTANDER</span>
                      <span className="text-[10px] font-serif leading-tight line-through opacity-60">{card.word}</span>
                    </>
                  )
                ) : (
                  <span className="text-[10.5px] font-serif font-bold text-[#3D3025] leading-tight">
                    {card.word}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Turn Actions */}
        {!gameOver && (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-[10px] text-[#8C7658] font-serif">
              剩余需探寻密语: <span className="font-bold text-[#8C1D35]">{remainingAgents}</span>
            </div>

            <button
              onClick={handleNextTurn}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-cinzel font-bold tracking-wider hover:brightness-105 active:scale-95 transition-all cursor-pointer border border-[#D4AF37]/50 shadow-xs"
            >
              完成猜词 · 交换出题 ➡️
            </button>
          </div>
        )}

        {/* Game Over Banner */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 p-3 rounded-2xl border text-center font-serif shadow-xs ${
              gameOver === 'win'
                ? 'bg-gradient-to-r from-[#FAF5EB] to-[#FFFDF9] border-[#D4AF37] text-[#8C1D35]'
                : 'bg-[#2C181D] border-[#8C1D35] text-[#FFE599]'
            }`}
          >
            {gameOver === 'win' ? (
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel font-bold text-[#8C1D35]">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>PERFECT HARMONY · 默契通关！</span>
                </div>
                <p className="text-[10px] text-[#7A6750] mt-0.5 italic">
                  全部如尼暗语已被破译，你们的默契超越了霍格沃茨百年预言！
                </p>
              </div>
            ) : gameOver === 'lose_dementor' ? (
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel font-bold text-[#FF8080]">
                  <Skull className="w-4 h-4 text-[#FF8080]" />
                  <span>DEMENTOR AWAKENED · 误触摄魂怪！</span>
                </div>
                <p className="text-[10px] text-[#FFD6D6] mt-0.5 italic">
                  不幸掀开了禁忌词汇，速速给对方一个温暖拥抱施展呼神护卫 ✨
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel font-bold text-[#FFE599]">
                  <HelpCircle className="w-4 h-4 text-[#FFE599]" />
                  <span>TIME EXPIRED · 墨迹风干</span>
                </div>
                <p className="text-[10px] text-[#EADBC4] mt-0.5 italic">
                  探寻回合已耗尽，洗牌再开一局探察新默契！
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================
            3. RULE & HOW TO PLAY MODAL (清晰玩法说明弹窗)
        ======================================================== */}
        <AnimatePresence>
          {showRuleModal && (
            <div className="fixed inset-0 z-50 bg-[#111A27]/70 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="w-full max-w-sm rounded-3xl p-5 bg-[#FCF9F2] shadow-2xl border-2 border-[#D4AF37]/60 text-[#2C241E] space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-[#D9C89E]/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📜</span>
                    <h3 className="text-xs font-bold font-cinzel tracking-wider text-[#8C1D35]">
                      HOW TO PLAY · 30秒搞懂玩法
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowRuleModal(false)}
                    className="w-6 h-6 rounded-full bg-[#FAF5EB] text-[#8C7658] hover:text-[#8C1D35] flex items-center justify-center border border-[#D9C89E] text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed text-[#524336] font-serif max-h-72 overflow-y-auto pr-1">
                  <div className="p-2 rounded-xl bg-[#FAF5EB] border border-[#D9C89E]/60">
                    <span className="font-bold text-[#8C1D35] block mb-0.5">🎯 游戏目标</span>
                    你们是心有灵犀的双人搭档，需要在 <strong>9 个回合内</strong>，互相出题配合，共同找出所有的<strong>【绿色目标词】</strong>！
                  </div>

                  <div className="p-2 rounded-xl bg-[#FAF5EB] border border-[#D9C89E]/60">
                    <span className="font-bold text-[#8C1D35] block mb-0.5">👁️ 步骤一：出题人看密码</span>
                    轮到你出题时，点击<strong>「查看我方密码」</strong>（把手机侧过来不让对方看到）。你会看到哪些词是<strong>绿色（目标词）</strong>，哪一个是<strong>红色（地雷词，碰了直接输）</strong>。
                  </div>

                  <div className="p-2 rounded-xl bg-[#FAF5EB] border border-[#D9C89E]/60">
                    <span className="font-bold text-[#8C1D35] block mb-0.5">🗣️ 步骤二：口头给线索</span>
                    对对方说出：<strong>【1个线索词 + 1个数字】</strong>。<br />
                    <em>例如你的绿色词有「奶茶」和「火锅」，你可以对她说：“好吃的 2” 或 “冬天 2”。</em>
                  </div>

                  <div className="p-2 rounded-xl bg-[#FAF5EB] border border-[#D9C89E]/60">
                    <span className="font-bold text-[#8C1D35] block mb-0.5">👆 步骤三：对方猜词翻牌</span>
                    对方根据你的提示，在 16 个方格中点击猜词。猜完后点击<strong>「交换出题」</strong>换对方出题。避开地雷词全部找齐即默契通关！
                  </div>
                </div>

                <button
                  onClick={() => setShowRuleModal(false)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-cinzel font-bold tracking-wider cursor-pointer border border-[#D4AF37]/50 shadow-xs"
                >
                  我懂了 · 立即开始心有灵犀
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
