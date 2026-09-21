import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Swords, Eye, RotateCcw, HelpCircle, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface CardDef {
  id: number;
  value: number;
  name: string;
  count: number;
  effect: string;
  desc: string;
  badgeColor: string;
  artBg: string;
}

export const LOVE_LETTER_CARDS: CardDef[] = [
  { id: 1, value: 1, name: '卫兵 · 探念', count: 5, effect: '猜牌淘汰', desc: '猜对方手牌（非卫兵），猜中直接击杀对方淘汰！', badgeColor: 'bg-[#1E3A8A] text-[#93C5FD]', artBg: 'from-[#1E3A8A]/20 to-[#0F172A]' },
  { id: 2, value: 2, name: '牧师 · 窥心', count: 2, effect: '偷看底牌', desc: '私密偷看对方手里的底牌一眼，知己知彼。', badgeColor: 'bg-[#14532D] text-[#86EFAC]', artBg: 'from-[#14532D]/20 to-[#064E3B]' },
  { id: 3, value: 3, name: '男爵 · 决斗', count: 2, effect: '比大小点', desc: '与对方秘密拼点，手牌较小的一方当场出局！', badgeColor: 'bg-[#7C2D12] text-[#FDBA74]', artBg: 'from-[#7C2D12]/20 to-[#431407]' },
  { id: 4, value: 4, name: '侍女 · 护身', count: 2, effect: '绝对无敌', desc: '到下一回合前，完全免疫对方所有的卡牌效果。', badgeColor: 'bg-[#047857] text-[#A7F3D0]', artBg: 'from-[#047857]/20 to-[#065F46]' },
  { id: 5, value: 5, name: '王子 · 弃牌', count: 2, effect: '强制换牌', desc: '强制对方扔掉手牌重摸一张；若弃掉公主则直接淘汰！', badgeColor: 'bg-[#581C87] text-[#D8B4FE]', artBg: 'from-[#581C87]/20 to-[#3B0764]' },
  { id: 6, value: 6, name: '国王 · 互易', count: 1, effect: '强行交换', desc: '与对方强行交换手中的卡牌，占领主动权。', badgeColor: 'bg-[#854D0E] text-[#FDE047]', artBg: 'from-[#854D0E]/20 to-[#713F12]' },
  { id: 7, value: 7, name: '夫人 · 傲慢', count: 1, effect: '被动打出', desc: '若手中有王子或国王，必须打出此牌。', badgeColor: 'bg-[#9D174D] text-[#FBCFE8]', artBg: 'from-[#9D174D]/20 to-[#831843]' },
  { id: 8, value: 8, name: '公主 · 誓约', count: 1, effect: '最高8点', desc: '点数最高！但若打出或被迫弃掉，直接自爆出局！', badgeColor: 'bg-[#8C1D35] text-[#FFE599]', artBg: 'from-[#8C1D35]/30 to-[#4A0E17]' }
];

export const LoveLetterGame: React.FC = () => {
  // Game setup
  const initDeck = () => {
    const d: CardDef[] = [];
    LOVE_LETTER_CARDS.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        d.push({ ...c, id: Number(`${c.value}${i}`) });
      }
    });
    // Shuffle
    return d.sort(() => Math.random() - 0.5);
  };

  const startRound = () => {
    const d = initDeck();
    // Burn 1 card face down (classic rule)
    d.pop();
    // 3 extra burn cards for 2-player variant
    d.pop();
    d.pop();
    d.pop();

    const p1Card = d.pop()!;
    const p2Card = d.pop()!;

    return {
      deck: d,
      handA: [p1Card],
      handB: [p2Card],
      drawnCardA: null as CardDef | null,
      drawnCardB: null as CardDef | null,
      protectedA: false,
      protectedB: false
    };
  };

  const [state, setState] = useState(startRound);
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A'); // Player A (HE), Player B (HER)
  const [tokensA, setTokensA] = useState(0);
  const [tokensB, setTokensB] = useState(0);
  const [peekingCard, setPeekingCard] = useState<CardDef | null>(null);
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [log, setLog] = useState<string>('游戏开始，请出牌！');
  const [roundWinner, setRoundWinner] = useState<'A' | 'B' | 'tie' | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [hideHand, setHideHand] = useState(false);

  // Turn draw
  const drawCardForCurrent = () => {
    if (state.deck.length === 0) {
      // Deck empty -> Compare highest card
      endRoundCompare();
      return;
    }

    const nextDeck = [...state.deck];
    const card = nextDeck.pop()!;

    if (activePlayer === 'A') {
      setState((prev) => ({
        ...prev,
        deck: nextDeck,
        drawnCardA: card,
        protectedA: false
      }));
    } else {
      setState((prev) => ({
        ...prev,
        deck: nextDeck,
        drawnCardB: card,
        protectedB: false
      }));
    }
  };

  // Auto draw at start of turn if needed
  React.useEffect(() => {
    if (roundWinner) return;
    if (activePlayer === 'A' && state.handA.length === 1 && !state.drawnCardA) {
      drawCardForCurrent();
    } else if (activePlayer === 'B' && state.handB.length === 1 && !state.drawnCardB) {
      drawCardForCurrent();
    }
  }, [activePlayer, state.handA, state.handB, state.drawnCardA, state.drawnCardB, roundWinner]);

  // Round Winner handler
  const winRound = (winner: 'A' | 'B', reason: string) => {
    setRoundWinner(winner);
    setLog(`${winner === 'A' ? 'HE (黑曜石)' : 'HER (秘银石)'} 获胜！${reason}`);

    if (winner === 'A') {
      const nextA = tokensA + 1;
      setTokensA(nextA);
      if (nextA >= 3) {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
      }
    } else {
      const nextB = tokensB + 1;
      setTokensB(nextB);
      if (nextB >= 3) {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
      }
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 50, 90]);
      } catch {}
    }
  };

  const endRoundCompare = () => {
    const cardA = state.handA[0];
    const cardB = state.handB[0];
    if (!cardA || !cardB) return;

    if (cardA.value > cardB.value) {
      winRound('A', `手牌点数更大（${cardA.name} > ${cardB.name}）`);
    } else if (cardB.value > cardA.value) {
      winRound('B', `手牌点数更大（${cardB.name} > ${cardA.name}）`);
    } else {
      setRoundWinner('tie');
      setLog(`点数相同（${cardA.value}点），平分秋色！`);
    }
  };

  // Play a card
  const handlePlayCard = (cardToPlay: CardDef) => {
    const isPlayerA = activePlayer === 'A';
    const currentHand = isPlayerA ? [state.handA[0], state.drawnCardA!] : [state.handB[0], state.drawnCardB!];
    const remainingCard = currentHand.find((c) => c !== cardToPlay) || currentHand[0];

    // Countess rule check: if holding Prince (5) or King (6), must discard Countess (7)
    const hasPrinceOrKing = currentHand.some((c) => c.value === 5 || c.value === 6);
    if (hasPrinceOrKing && cardToPlay.value !== 7 && currentHand.some((c) => c.value === 7)) {
      setLog('⚠️ 规则限制：手中有王子或国王时，必须打出伯爵夫人！');
      return;
    }

    // Princess rule: discard princess -> lose immediately
    if (cardToPlay.value === 8) {
      winRound(isPlayerA ? 'B' : 'A', '打出了公主，直接失手出局！');
      return;
    }

    // Guard (1): Guess card modal
    if (cardToPlay.value === 1) {
      setShowGuessModal(true);
      return;
    }

    // Priest (2): Peek opponent hand
    if (cardToPlay.value === 2) {
      const oppCard = isPlayerA ? state.handB[0] : state.handA[0];
      const oppProtected = isPlayerA ? state.protectedB : state.protectedA;
      if (oppProtected) {
        setLog('对方受【盔甲护身】庇护，无法探察底牌！');
      } else {
        setPeekingCard(oppCard);
        setLog(`已施展【摄神取念】，偷看到了对方手牌！`);
      }
      finishPlayCard(remainingCard, false);
      return;
    }

    // Baron (3): Duel
    if (cardToPlay.value === 3) {
      const oppProtected = isPlayerA ? state.protectedB : state.protectedA;
      if (oppProtected) {
        setLog('对方受【盔甲护身】庇护，决斗无效！');
      } else {
        const oppCard = isPlayerA ? state.handB[0] : state.handA[0];
        if (remainingCard.value > oppCard.value) {
          winRound(isPlayerA ? 'A' : 'B', `决斗交锋胜利！（${remainingCard.value} > ${oppCard.value}）`);
          return;
        } else if (remainingCard.value < oppCard.value) {
          winRound(isPlayerA ? 'B' : 'A', `决斗交锋落败！（${remainingCard.value} < ${oppCard.value}）`);
          return;
        } else {
          setLog('决斗交锋势均力敌，未分胜负！');
        }
      }
      finishPlayCard(remainingCard, false);
      return;
    }

    // Handmaid (4): Protection
    if (cardToPlay.value === 4) {
      setLog('施展【盔甲护身】，本轮免疫所有攻击！');
      finishPlayCard(remainingCard, true);
      return;
    }

    // Prince (5): Discard and redraw
    if (cardToPlay.value === 5) {
      const oppProtected = isPlayerA ? state.protectedB : state.protectedA;
      if (oppProtected) {
        setLog('对方受【盔甲护身】庇护，飞来咒无效！');
      } else {
        const oppCard = isPlayerA ? state.handB[0] : state.handA[0];
        if (oppCard.value === 8) {
          winRound(isPlayerA ? 'A' : 'B', '对方被迫弃掉公主，直接淘汰出局！');
          return;
        }
        // Opponent draws new card
        if (state.deck.length > 0) {
          const nextDeck = [...state.deck];
          const newCard = nextDeck.pop()!;
          if (isPlayerA) {
            setState((p) => ({ ...p, deck: nextDeck, handB: [newCard] }));
          } else {
            setState((p) => ({ ...p, deck: nextDeck, handA: [newCard] }));
          }
          setLog('对方弃掉了手牌，并重新摸取了一张！');
        } else {
          setLog('牌库已空，对方无牌可摸！');
        }
      }
      finishPlayCard(remainingCard, false);
      return;
    }

    // King (6): Swap hands
    if (cardToPlay.value === 6) {
      const oppProtected = isPlayerA ? state.protectedB : state.protectedA;
      if (oppProtected) {
        setLog('对方受【盔甲护身】庇护，换牌无效！');
        finishPlayCard(remainingCard, false);
      } else {
        const oppCard = isPlayerA ? state.handB[0] : state.handA[0];
        if (isPlayerA) {
          setState((p) => ({ ...p, handA: [oppCard], handB: [remainingCard], drawnCardA: null }));
        } else {
          setState((p) => ({ ...p, handB: [oppCard], handA: [remainingCard], drawnCardB: null }));
        }
        setLog('【双杖互易】生效！双方交换了手牌！');
        endTurn();
        return;
      }
      return;
    }

    // Countess (7)
    if (cardToPlay.value === 7) {
      setLog('打出了【伯爵夫人 · 傲慢】！');
      finishPlayCard(remainingCard, false);
      return;
    }
  };

  const finishPlayCard = (remainingCard: CardDef, isProtected: boolean) => {
    if (activePlayer === 'A') {
      setState((prev) => ({
        ...prev,
        handA: [remainingCard],
        drawnCardA: null,
        protectedA: isProtected
      }));
    } else {
      setState((prev) => ({
        ...prev,
        handB: [remainingCard],
        drawnCardB: null,
        protectedB: isProtected
      }));
    }
    endTurn();
  };

  const handleConfirmGuess = (guessedVal: number) => {
    setShowGuessModal(false);
    const isPlayerA = activePlayer === 'A';
    const oppCard = isPlayerA ? state.handB[0] : state.handA[0];
    const oppProtected = isPlayerA ? state.protectedB : state.protectedA;

    const currentHand = isPlayerA ? [state.handA[0], state.drawnCardA!] : [state.handB[0], state.drawnCardB!];
    const remainingCard = currentHand.find((c) => c.value !== 1) || currentHand[0];

    if (oppProtected) {
      setLog('对方受【盔甲护身】庇护，猜牌免疫！');
    } else if (oppCard.value === guessedVal) {
      winRound(isPlayerA ? 'A' : 'B', `猜中了对方手牌【${oppCard.name}】！一击必杀淘汰！`);
      return;
    } else {
      setLog(`猜错了！（对方并不是 ${LOVE_LETTER_CARDS.find((c) => c.value === guessedVal)?.name}）`);
    }

    finishPlayCard(remainingCard, false);
  };

  const endTurn = () => {
    setActivePlayer((p) => (p === 'A' ? 'B' : 'A'));
    setHideHand(true); // Mask screen for pass & play secrecy
  };

  const handleNextRound = () => {
    setState(startRound());
    setRoundWinner(null);
    setPeekingCard(null);
    setLog('新一局密令对决开始！');
    setHideHand(false);
  };

  const isPlayerA = activePlayer === 'A';
  const currentHandCards = isPlayerA
    ? [state.handA[0], state.drawnCardA].filter(Boolean) as CardDef[]
    : [state.handB[0], state.drawnCardB].filter(Boolean) as CardDef[];

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-5 font-serif select-none">
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-4 sm:p-5 text-[#2C241E] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9C89E]/60 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/40 text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 text-[#FFE599] fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                  LOVE LETTER · 情书密令
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#8C1D35] font-cinzel border border-[#D4AF37]/30">
                  TOP 1 MIND GAME
                </span>
              </div>
              <h2 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                摸一张出一张 · 猜心心理博弈
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowRules(true)}
              className="px-2 py-1 rounded-xl bg-[#FAF5EB] text-[#8C1D35] hover:bg-[#EADBC4] border border-[#D4AF37]/50 text-[10px] font-bold font-serif flex items-center gap-1 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>卡牌表</span>
            </button>
            <button
              onClick={handleNextRound}
              className="p-1.5 rounded-xl bg-[#FAF5EB] text-[#8C7658] hover:text-[#8C1D35] hover:bg-[#EADBC4] border border-[#D9C89E]/70 transition-colors cursor-pointer"
              title="重开一局"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Score & Deck Status Bar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF5EB] border border-[#D9C89E]/60 mb-2.5 text-xs font-cinzel">
          {/* HE Hearts */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#8C7658]">HE:</span>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 ${i < tokensA ? 'text-[#8C1D35] fill-current' : 'text-[#D9C89E]'}`}
                />
              ))}
            </div>
          </div>

          {/* Remaining in Deck */}
          <div className="text-[10.5px] font-bold text-[#C5A059] flex items-center gap-1">
            <span>DECK: {state.deck.length} 张</span>
          </div>

          {/* HER Hearts */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#8C7658]">HER:</span>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 ${i < tokensB ? 'text-[#8C1D35] fill-current' : 'text-[#D9C89E]'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Narrative Battle Log */}
        <div className="p-2.5 rounded-xl bg-[#FAF6EE] border border-[#D9C89E]/60 mb-3 text-[11px] font-serif text-[#524336] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>{log}</span>
          </div>
          <span className="font-cinzel text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#8C1D35] text-[#FFFDF5]">
            {activePlayer === 'A' ? 'HE 回合' : 'HER 回合'}
          </span>
        </div>

        {/* Pass & Play Masking Overlay (Prevent seeing opponent hand) */}
        {hideHand && !roundWinner && (
          <div className="p-5 rounded-2xl bg-[#111A27] text-center text-[#FFFDF5] space-y-2 mb-3 border border-[#D4AF37]/50 shadow-inner">
            <span className="text-2xl block">🤫</span>
            <h4 className="text-xs font-cinzel font-bold text-[#FFE599]">
              请将手机转交给 {activePlayer === 'A' ? 'HE' : 'HER'}
            </h4>
            <p className="text-[10px] text-[#A8987E] font-serif">
              “保持神秘 · 严防偷窥手牌”
            </p>
            <button
              onClick={() => setHideHand(false)}
              className="px-4 py-1.5 rounded-full bg-[#8C1D35] text-[#FFFDF5] text-xs font-serif font-bold cursor-pointer border border-[#D4AF37]/50 shadow-xs"
            >
              我是本人 · 点击看牌
            </button>
          </div>
        )}

        {/* Player Hands Display */}
        {!hideHand && !roundWinner && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-[10px] text-[#8C7658] font-cinzel px-1">
              <span>你的手牌（点击即可打出）：</span>
              <span>{isPlayerA ? (state.protectedA ? '🛡️ 已受护身符保护' : '') : (state.protectedB ? '🛡️ 已受护身符保护' : '')}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentHandCards.map((card, idx) => (
                <motion.button
                  key={`${card.id}-${idx}`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  onClick={() => handlePlayCard(card)}
                  className={`p-3.5 rounded-2xl bg-gradient-to-b ${card.artBg} border-2 border-[#D4AF37] hover:border-[#FFE599] shadow-md text-left flex flex-col justify-between h-36 cursor-pointer transition-all relative overflow-hidden group`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-[#8C1D35] text-[#FFE599] flex items-center justify-center font-mono font-bold text-sm shadow-xs border border-[#FFE599]/40">
                      {card.value}
                    </span>
                    <span className={`text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-2xs ${card.badgeColor}`}>
                      {card.effect}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#FFFDF5] font-serif drop-shadow-xs">
                      {card.name}
                    </h4>
                    <p className="text-[10px] text-[#F3E5AB] font-serif leading-tight line-clamp-2 opacity-90">
                      {card.desc}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Peek Opponent Card Modal (Priest Effect) */}
        <AnimatePresence>
          {peekingCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-3 rounded-2xl bg-[#182638] border border-[#D4AF37] text-[#FFFDF5] mb-3 text-center space-y-1.5 shadow-md"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel text-[#FFE599] font-bold">
                <Eye className="w-3.5 h-3.5" />
                <span>【摄神取念】探察结果</span>
              </div>
              <p className="text-xs font-serif">
                对方手中的秘密底牌是：
                <strong className="text-[#FFE599] ml-1">
                  [{peekingCard.value}点] {peekingCard.name}
                </strong>
              </p>
              <button
                onClick={() => setPeekingCard(null)}
                className="px-3 py-1 rounded-lg bg-[#8C1D35] text-[10px] font-serif cursor-pointer border border-[#D4AF37]/40"
              >
                我知道了 · 闭上心眼
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guess Card Modal (Guard Effect) */}
        <AnimatePresence>
          {showGuessModal && (
            <div className="p-3 rounded-2xl bg-[#111A27] border border-[#D4AF37] text-[#FFFDF5] mb-3 space-y-2 shadow-md">
              <div className="flex items-center justify-between text-xs font-cinzel text-[#FFE599] font-bold">
                <span className="flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" />
                  【卫兵魔杖】指定猜一张手牌：
                </span>
              </div>
              <p className="text-[10px] text-[#A8987E] font-serif">
                猜中对方手牌即可一击淘汰对方（不可猜卫兵自身）：
              </p>
              <div className="grid grid-cols-4 gap-1">
                {LOVE_LETTER_CARDS.filter((c) => c.value > 1).map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleConfirmGuess(c.value)}
                    className="py-1 px-1 rounded bg-[#182638] hover:bg-[#8C1D35] text-[10px] font-serif truncate border border-[#D4AF37]/30 text-[#FFE599] cursor-pointer"
                  >
                    {c.value}. {c.name.split(' · ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Round Win Banner */}
        {roundWinner && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF5EB] to-[#FFFDF9] border border-[#D4AF37] text-center space-y-2 shadow-xs mb-3"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel font-bold text-[#8C1D35]">
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
              <span>本轮对决结案！</span>
            </div>
            <p className="text-xs font-serif text-[#2C241E] font-bold">
              {log}
            </p>
            <div className="pt-1">
              <button
                onClick={handleNextRound}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-cinzel font-bold tracking-wider cursor-pointer border border-[#D4AF37]/50 shadow-xs"
              >
                开启下一轮对决 ➡️
              </button>
            </div>
          </motion.div>
        )}

        {/* Card Glossary Modal */}
        <AnimatePresence>
          {showRules && (
            <div className="fixed inset-0 z-50 bg-[#111A27]/70 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="w-full max-w-sm rounded-3xl p-5 bg-[#FCF9F2] shadow-2xl border-2 border-[#D4AF37]/60 text-[#2C241E] space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-[#D9C89E]/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👑</span>
                    <h3 className="text-xs font-bold font-cinzel tracking-wider text-[#8C1D35]">
                      LOVE LETTER · 8大卡牌效果秘典
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowRules(false)}
                    className="w-6 h-6 rounded-full bg-[#FAF5EB] text-[#8C7658] hover:text-[#8C1D35] flex items-center justify-center border border-[#D9C89E] text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 text-[11px] font-serif">
                  {LOVE_LETTER_CARDS.map((c) => (
                    <div key={c.value} className="p-2 rounded-xl bg-[#FAF5EB] border border-[#D9C89E]/60">
                      <div className="flex items-center justify-between font-bold text-[#8C1D35] mb-0.5">
                        <span>{c.value}点 · {c.name} ({c.count}张)</span>
                        <span className="text-[9px] px-1 rounded bg-[#8C1D35]/10 text-[#8C1D35] font-cinzel">{c.effect}</span>
                      </div>
                      <p className="text-[10px] text-[#524336] leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowRules(false)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-cinzel font-bold tracking-wider cursor-pointer border border-[#D4AF37]/50 shadow-xs"
                >
                  关闭秘典
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
