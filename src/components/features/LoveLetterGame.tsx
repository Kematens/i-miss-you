import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Swords, Eye, RotateCcw, HelpCircle, Sparkles, Trophy, Shield, Wifi, Hourglass, Send, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClickSpark } from '../animations/ClickSpark';
import { ShinyText } from '../animations/ShinyText';
import { useCouple } from '../../context/CoupleContext';

export interface CardDef {
  id: number;
  value: number;
  name: string;
  count: number;
  effect: string;
  desc: string;
  badgeColor: string;
  artBg: string;
  icon: string;
  roman: string;
}

export const LOVE_LETTER_CARDS: CardDef[] = [
  { id: 1, value: 1, name: '卫兵 · 探念', count: 5, effect: '猜牌淘汰', desc: '猜对方手牌（非卫兵），猜中直接击杀淘汰！', badgeColor: 'bg-[#1E3A8A] text-[#93C5FD]', artBg: 'from-[#1E3A8A] to-[#0F172A]', icon: '⚔️', roman: 'I' },
  { id: 2, value: 2, name: '牧师 · 窥心', count: 2, effect: '偷看手牌', desc: '私密偷看对方当前手里握着的那张牌，知己知彼。', badgeColor: 'bg-[#14532D] text-[#86EFAC]', artBg: 'from-[#14532D] to-[#064E3B]', icon: '👁️', roman: 'II' },
  { id: 3, value: 3, name: '男爵 · 决斗', count: 2, effect: '比大小点', desc: '与对方秘密拼点，手牌较小的一方当场出局！', badgeColor: 'bg-[#7C2D12] text-[#FDBA74]', artBg: 'from-[#7C2D12] to-[#431407]', icon: '🗡️', roman: 'III' },
  { id: 4, value: 4, name: '侍女 · 护身', count: 2, effect: '绝对无敌', desc: '到下一回合前，完全免疫对方所有的卡牌效果。', badgeColor: 'bg-[#047857] text-[#A7F3D0]', artBg: 'from-[#047857] to-[#065F46]', icon: '🛡️', roman: 'IV' },
  { id: 5, value: 5, name: '王子 · 弃牌', count: 2, effect: '强制换牌', desc: '强制对方扔掉手牌重摸一张；若弃掉公主则直接淘汰！', badgeColor: 'bg-[#581C87] text-[#D8B4FE]', artBg: 'from-[#581C87] to-[#3B0764]', icon: '🪄', roman: 'V' },
  { id: 6, value: 6, name: '国王 · 互易', count: 1, effect: '强行交换', desc: '与对方强行交换手中的卡牌，占领主动权。', badgeColor: 'bg-[#854D0E] text-[#FDE047]', artBg: 'from-[#854D0E] to-[#713F12]', icon: '👑', roman: 'VI' },
  { id: 7, value: 7, name: '夫人 · 傲慢', count: 1, effect: '被动打出', desc: '若手中有王子或国王，必须打出此牌。', badgeColor: 'bg-[#9D174D] text-[#FBCFE8]', artBg: 'from-[#9D174D] to-[#831843]', icon: '🌹', roman: 'VII' },
  { id: 8, value: 8, name: '公主 · 誓约', count: 1, effect: '最高8点', desc: '点数最高！但若打出或被迫弃掉，直接自爆出局！', badgeColor: 'bg-[#8C1D35] text-[#FFE599]', artBg: 'from-[#8C1D35] to-[#4A0E17]', icon: '💖', roman: 'VIII' }
];

interface FloatingEmoji {
  id: number;
  text: string;
  sender: 'A' | 'B';
  x: number;
}

export const LoveLetterGame: React.FC = () => {
  // Game setup
  const initDeck = () => {
    const d: CardDef[] = [];
    LOVE_LETTER_CARDS.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        d.push({ ...c, id: Number(`${c.value}${i}`) });
      }
    });
    return d.sort(() => Math.random() - 0.5);
  };

  const startRound = () => {
    const d = initDeck();
    d.pop(); // burn 1
    d.pop(); d.pop(); d.pop(); // 3 burn cards for 2-player variant

    const p1Card = d.pop()!;
    const p2Card = d.pop()!;

    return {
      deck: d,
      handA: [p1Card],
      handB: [p2Card],
      drawnCardA: null as CardDef | null,
      drawnCardB: null as CardDef | null,
      protectedA: false,
      protectedB: false,
      discardPile: [] as CardDef[]
    };
  };

  const [state, setState] = useState(startRound);
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A'); // Player A (HE), Player B (HER)
  const [tokensA, setTokensA] = useState(0);
  const [tokensB, setTokensB] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [peekingCard, setPeekingCard] = useState<CardDef | null>(null);
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [log, setLog] = useState<string>('宫廷密信已发，请从手牌中摸一出一！');
  const [roundWinner, setRoundWinner] = useState<'A' | 'B' | 'tie' | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [hideHand, setHideHand] = useState(false);

  // Online Multiplayer State via CoupleContext
  const { myRole, partnerOnline, pairingCode, sendEvent, onEvent } = useCouple();
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [myOnlineRole, setMyOnlineRole] = useState<'A' | 'B'>(() => (myRole === 'HE' ? 'A' : 'B'));
  const roomCode = pairingCode;
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [drawingCardAnim, setDrawingCardAnim] = useState<CardDef | null>(null);
  const [slammingCardAnim, setSlammingCardAnim] = useState<CardDef | null>(null);

  // Sync role with myRole
  useEffect(() => {
    setMyOnlineRole(myRole === 'HE' ? 'A' : 'B');
  }, [myRole]);

  // Listen for remote reactions
  useEffect(() => {
    const unsubEmoji = onEvent<FloatingEmoji>('LOVE_LETTER_EMOJI', (emoji) => {
      if (emoji?.text) {
        setFloatingEmojis((prev) => [...prev, emoji]);
        setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter((e) => e.id !== emoji.id));
        }, 2000);
      }
    });
    return unsubEmoji;
  }, [onEvent]);

  // Turn draw
  const drawCardForCurrent = () => {
    if (state.deck.length === 0) {
      endRoundCompare();
      return;
    }

    const nextDeck = [...state.deck];
    const card = nextDeck.pop()!;

    // Trigger visual draw flight animation
    setDrawingCardAnim(card);
    setTimeout(() => {
      setDrawingCardAnim(null);
    }, 650);

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
    setLog(`${winner === 'A' ? '👦 HE' : '👧 HER'} 获胜！${reason}`);

    if (winner === 'A') {
      const nextA = tokensA + 1;
      setTokensA(nextA);
      if (nextA >= 3) {
        confetti({ particleCount: 70, spread: 85, origin: { y: 0.5 } });
      }
    } else {
      const nextB = tokensB + 1;
      setTokensB(nextB);
      if (nextB >= 3) {
        confetti({ particleCount: 70, spread: 85, origin: { y: 0.5 } });
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
      setLog(`双方手牌点数相同（${cardA.value}点），平分秋色！`);
    }
  };

  // Trigger floating reaction emoji across network
  const handleSendReaction = (emojiText: string) => {
    const newEmoji: FloatingEmoji = {
      id: Date.now() + Math.random(),
      text: emojiText,
      sender: myOnlineRole,
      x: 30 + Math.random() * 40
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    sendEvent('LOVE_LETTER_EMOJI', newEmoji);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 2000);
  };

  // Play a card
  const handlePlayCard = (cardToPlay: CardDef) => {
    const isPlayerA = activePlayer === 'A';
    const currentHand = isPlayerA ? [state.handA[0], state.drawnCardA!] : [state.handB[0], state.drawnCardB!];
    const remainingCard = currentHand.find((c) => c.id !== cardToPlay.id) || currentHand[0];

    // Countess rule check: if holding Prince (5) or King (6), must discard Countess (7)
    const hasPrinceOrKing = currentHand.some((c) => c.value === 5 || c.value === 6);
    if (hasPrinceOrKing && cardToPlay.value !== 7 && currentHand.some((c) => c.value === 7)) {
      setLog('⚠️ 规则限制：手中有王子或国王时，必须打出夫人！');
      return;
    }

    // Trigger physical slam animation onto table
    setSlammingCardAnim(cardToPlay);
    setTimeout(() => setSlammingCardAnim(null), 500);

    // Princess rule: discard princess -> lose immediately
    if (cardToPlay.value === 8) {
      finishPlayCard(cardToPlay, remainingCard, false);
      winRound(isPlayerA ? 'B' : 'A', '打出了公主，直接失手自爆出局！');
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
        setLog('对方受【护身】庇护，无法偷看手牌！');
      } else {
        setPeekingCard(oppCard);
        setLog(`已施展【窥心】，偷看到了对方当前手牌！`);
      }
      finishPlayCard(cardToPlay, remainingCard, false);
      return;
    }

    // Baron (3): Duel
    if (cardToPlay.value === 3) {
      const oppProtected = isPlayerA ? state.protectedB : state.protectedA;
      if (oppProtected) {
        setLog('对方受【护身】庇护，决斗无效！');
      } else {
        const oppCard = isPlayerA ? state.handB[0] : state.handA[0];
        if (remainingCard.value > oppCard.value) {
          finishPlayCard(cardToPlay, remainingCard, false);
          winRound(isPlayerA ? 'A' : 'B', `决斗交锋胜利！（${remainingCard.value}点 > ${oppCard.value}点）`);
          return;
        } else if (remainingCard.value < oppCard.value) {
          finishPlayCard(cardToPlay, remainingCard, false);
          winRound(isPlayerA ? 'B' : 'A', `决斗交锋落败！（${remainingCard.value}点 < ${oppCard.value}点）`);
          return;
        } else {
          setLog('决斗交锋势均力敌，未分胜负！');
        }
      }
      finishPlayCard(cardToPlay, remainingCard, false);
      return;
    }

    // Handmaid (4): Protection
    if (cardToPlay.value === 4) {
      setLog('打出【侍女 · 护身】，本轮免疫所有攻击！');
      finishPlayCard(cardToPlay, remainingCard, true);
      return;
    }

    // Prince (5): Discard and redraw
    if (cardToPlay.value === 5) {
      const oppProtected = isPlayerA ? state.protectedB : state.protectedA;
      if (oppProtected) {
        setLog('对方受【护身】庇护，换牌无效！');
      } else {
        const oppCard = isPlayerA ? state.handB[0] : state.handA[0];
        if (oppCard.value === 8) {
          finishPlayCard(cardToPlay, remainingCard, false);
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
          setLog('对方弃掉了原手牌，并重新摸取了一张！');
        } else {
          setLog('牌库已空，对方无牌可摸！');
        }
      }
      finishPlayCard(cardToPlay, remainingCard, false);
      return;
    }

    // King (6): Swap hands
    if (cardToPlay.value === 6) {
      const oppProtected = isPlayerA ? state.protectedB : state.protectedA;
      if (oppProtected) {
        setLog('对方受【护身】庇护，换牌无效！');
        finishPlayCard(cardToPlay, remainingCard, false);
      } else {
        const oppCard = isPlayerA ? state.handB[0] : state.handA[0];
        if (isPlayerA) {
          setState((p) => ({ ...p, handA: [oppCard], handB: [remainingCard], drawnCardA: null, discardPile: [...p.discardPile, cardToPlay] }));
        } else {
          setState((p) => ({ ...p, handB: [oppCard], handA: [remainingCard], drawnCardB: null, discardPile: [...p.discardPile, cardToPlay] }));
        }
        setLog('【国王 · 互易】生效！双方强行交换了手牌！');
        endTurn();
        return;
      }
      return;
    }

    // Countess (7)
    if (cardToPlay.value === 7) {
      setLog('打出了【夫人 · 傲慢】！');
      finishPlayCard(cardToPlay, remainingCard, false);
      return;
    }
  };

  const finishPlayCard = (cardPlayed: CardDef, remainingCard: CardDef, isProtected: boolean) => {
    setSelectedCardId(null);
    if (activePlayer === 'A') {
      setState((prev) => ({
        ...prev,
        handA: [remainingCard],
        drawnCardA: null,
        protectedA: isProtected,
        discardPile: [...prev.discardPile, cardPlayed]
      }));
    } else {
      setState((prev) => ({
        ...prev,
        handB: [remainingCard],
        drawnCardB: null,
        protectedB: isProtected,
        discardPile: [...prev.discardPile, cardPlayed]
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
    const guardCard = currentHand.find((c) => c.value === 1) || currentHand[0];
    const remainingCard = currentHand.find((c) => c.id !== guardCard.id) || currentHand[0];

    if (oppProtected) {
      setLog('对方受【护身】庇护，猜牌免疫！');
      finishPlayCard(guardCard, remainingCard, false);
    } else if (oppCard.value === guessedVal) {
      finishPlayCard(guardCard, remainingCard, false);
      winRound(isPlayerA ? 'A' : 'B', `猜中了对方手牌【${oppCard.name}】！一击必杀淘汰！`);
      return;
    } else {
      setLog(`猜错了！（对方并不是 ${LOVE_LETTER_CARDS.find((c) => c.value === guessedVal)?.name}）`);
      finishPlayCard(guardCard, remainingCard, false);
    }
  };

  const endTurn = () => {
    const nextPlayer = activePlayer === 'A' ? 'B' : 'A';
    setActivePlayer(nextPlayer);
    if (!isOnlineMode) {
      setHideHand(true); // Pass & play secrecy only in single phone offline mode
    }
  };

  const handleNextRound = () => {
    setState(startRound());
    setRoundWinner(null);
    setSelectedCardId(null);
    setPeekingCard(null);
    setLog('新一局宫廷密令开场，洗牌发牌！');
    setHideHand(false);
  };

  // Determine whose perspective to show
  const activeRole = isOnlineMode ? myOnlineRole : activePlayer;
  const isMyTurn = activePlayer === activeRole;

  const currentHandCards = activeRole === 'A'
    ? [state.handA[0], state.drawnCardA].filter(Boolean) as CardDef[]
    : [state.handB[0], state.drawnCardB].filter(Boolean) as CardDef[];

  const oppCardsCount = activeRole === 'A'
    ? (state.handB.length + (state.drawnCardB ? 1 : 0))
    : (state.handA.length + (state.drawnCardA ? 1 : 0));
  const oppProtected = activeRole === 'A' ? state.protectedB : state.protectedA;
  const lastDiscarded = state.discardPile[state.discardPile.length - 1];

  return (
    <ClickSpark sparkColors={['#FFE599', '#D4AF37', '#8C1D35', '#F59E0B']} sparkCount={7}>
      <div className="w-full max-w-md mx-auto px-4 sm:px-5 font-serif select-none relative">
        
        {/* Floating Reactions across Network */}
        <div className="absolute inset-x-0 top-20 pointer-events-none z-50 overflow-hidden h-64">
          <AnimatePresence>
            {floatingEmojis.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 180, scale: 0.6 }}
                animate={{ opacity: 1, y: 10, scale: 1.2 }}
                exit={{ opacity: 0, y: -40, scale: 0.8 }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
                style={{ left: `${e.x}%` }}
                className="absolute text-2xl filter drop-shadow-md bg-white/90 px-2 py-0.5 rounded-full border border-[#D4AF37]/50 shadow-lg text-black font-sans flex items-center gap-1"
              >
                <span>{e.text}</span>
                <span className="text-[9px] font-cinzel text-[#8C1D35] font-bold">
                  {e.sender === 'A' ? 'HE' : 'HER'}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-4 sm:p-5 text-[#2C241E] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#D9C89E]/60 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6B1226] via-[#8C1D35] to-[#B32645] border-2 border-[#D4AF37] text-[#FFE599] flex items-center justify-center shadow-md">
                <Heart className="w-4 h-4 text-[#FFE599] fill-current filter drop-shadow-xs" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] font-bold block leading-none">
                    LOVE LETTER
                  </span>
                  <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 font-cinzel font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${partnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {partnerOnline ? '双方已连线' : '云端待命中'}
                  </span>
                </div>
                <h2 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                  王室情书 · 触感扇形打牌对弈
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowRules(true)}
                className="px-2 py-1 rounded-xl bg-gradient-to-b from-[#FAF5EB] to-[#F0E4D0] text-[#8C1D35] hover:brightness-95 border border-[#D4AF37]/60 text-[10px] font-bold font-serif flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>秘典</span>
              </button>
              <button
                onClick={handleNextRound}
                className="p-1 rounded-xl bg-gradient-to-b from-[#FAF5EB] to-[#F0E4D0] text-[#8C7658] hover:text-[#8C1D35] border border-[#D9C89E]/70 transition-all cursor-pointer shadow-2xs"
                title="重开一局"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ONLINE MULTIPLAYER ROOM STATUS BAR (云端双人密室面板) */}
          <div className="p-2 rounded-2xl bg-gradient-to-r from-[#182638] via-[#101924] to-[#182638] border-2 border-[#D4AF37]/50 text-[#FFFDF5] mb-2.5 shadow-md flex items-center justify-between text-[10px] font-cinzel">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="text-[#FFE599] font-bold">房号: {roomCode}</span>
              </div>
              <span className="text-[#A8987E]">|</span>
              <span className="text-emerald-400 font-mono">24ms</span>
            </div>

            {/* Online Mode Switch & Perspective Toggle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOnlineMode(!isOnlineMode)}
                className="px-2 py-0.5 rounded-lg bg-[#2A3B4D] hover:bg-[#3B4E63] text-[#FFE599] border border-[#D4AF37]/40 text-[9px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                title="切换单机同屏或双机在线模式"
              >
                <Users className="w-3 h-3" />
                <span>{isOnlineMode ? '双端在线' : '单屏面对面'}</span>
              </button>

              {isOnlineMode && (
                <button
                  onClick={() => setMyOnlineRole((r) => (r === 'A' ? 'B' : 'A'))}
                  className="px-2 py-0.5 rounded-lg bg-[#8C1D35] text-[#FFFDF5] border border-[#FFE599]/40 text-[9px] font-bold cursor-pointer transition-transform active:scale-95 shadow-2xs"
                  title="模拟切换当前手机的第一人称视角"
                >
                  切视角: {myOnlineRole === 'A' ? '👦 HE' : '👧 HER'}
                </button>
              )}
            </div>
          </div>

          {/* Score & Deck Status Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#FAF5EB] via-[#FFFDF9] to-[#FAF5EB] border-2 border-[#D4AF37]/45 mb-2.5 text-xs font-cinzel shadow-xs">
            {/* HE Hearts */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#8C7658] font-bold">👦 HE:</span>
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 filter drop-shadow-2xs ${i < tokensA ? 'text-[#8C1D35] fill-current animate-pulse' : 'text-[#D9C89E]'}`}
                  />
                ))}
              </div>
            </div>

            {/* Turn Indicator with ShinyText */}
            <div className="px-2.5 py-0.5 rounded-full bg-[#8C1D35] shadow-2xs flex items-center gap-1">
              {isMyTurn ? (
                <ShinyText text="✨ 轮到你行动" className="text-[10px] font-cinzel font-bold text-[#FFE599]" speed={3} />
              ) : (
                <span className="text-[10px] font-cinzel font-bold text-[#FFE599]">
                  {activePlayer === 'A' ? '👦 HE 出牌中' : '👧 HER 出牌中'}
                </span>
              )}
            </div>

            {/* HER Hearts */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#8C7658] font-bold">👧 HER:</span>
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 filter drop-shadow-2xs ${i < tokensB ? 'text-[#8C1D35] fill-current animate-pulse' : 'text-[#D9C89E]'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================
              CARD TABLE FELT MAT: OPPONENT HAND + BATTLE FELT
          ======================================================== */}
          <div className="p-3.5 rounded-3xl bg-gradient-to-b from-[#111A24] via-[#162231] to-[#0D141C] border-2 border-[#D4AF37]/60 text-[#FFFDF5] shadow-2xl relative overflow-hidden mb-2.5">
            
            {/* Soft Ambient Aurora on Tabletop */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="w-full h-full bg-gradient-to-tr from-amber-600/30 via-rose-700/20 to-blue-900/30 blur-2xl" />
            </div>

            {/* Opponent Area */}
            <div className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-2 mb-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-base">{activeRole === 'A' ? '👧' : '👦'}</span>
                <div>
                  <span className="text-xs font-serif font-bold text-[#EADBC4] block leading-tight">
                    {activeRole === 'A' ? 'HER 的手牌' : 'HE 的手牌'}
                  </span>
                  {!isMyTurn && (
                    <span className="text-[9px] text-[#FFE599] flex items-center gap-1 font-serif animate-pulse">
                      <Hourglass className="w-2.5 h-2.5 animate-spin" />
                      正在摸牌斟酌对策中...
                    </span>
                  )}
                </div>
                {oppProtected && (
                  <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-[#14532D] text-[#86EFAC] border border-[#86EFAC]/40 animate-pulse">
                    <Shield className="w-2.5 h-2.5" />
                    已护身
                  </span>
                )}
              </div>

              {/* Opponent Face-down Cards Back with subtle floating pulse */}
              <div className="flex gap-1.5">
                {Array.from({ length: Math.max(1, oppCardsCount) }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={!isMyTurn ? { y: [0, -3, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: i * 0.3 }}
                    className="w-9 h-13 rounded-lg bg-gradient-to-tr from-[#6B1226] via-[#8C1D35] to-[#4A0E17] border border-[#D4AF37] shadow-md flex flex-col items-center justify-center relative"
                  >
                    <span className="text-xs text-[#FFE599]">⚜️</span>
                    {!isMyTurn && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Central Battle Velvet Mat: 3D Deck & Discard Zone */}
            <div className="grid grid-cols-2 gap-3 py-1.5 items-center relative z-10">
              
              {/* Draw Deck (3D stacked with Draw Flight Animation) */}
              <div className="flex flex-col items-center relative">
                <span className="text-[9.5px] font-cinzel text-[#C5A059] mb-1 font-bold">
                  🎴 牌库 ({state.deck.length}张)
                </span>
                <div className="relative">
                  <div className="w-16 h-22 rounded-xl bg-[#4A0E17] border border-[#D4AF37]/40 absolute -top-1.5 -left-1.5" />
                  <div className="w-16 h-22 rounded-xl bg-[#6B1226] border border-[#D4AF37]/60 absolute -top-0.5 -left-0.5" />
                  <div className="w-16 h-22 rounded-xl bg-gradient-to-tr from-[#8C1D35] to-[#5C0D1E] border-2 border-[#D4AF37] shadow-xl relative z-10 flex flex-col items-center justify-center p-1">
                    <span className="text-lg">⚜️</span>
                    <span className="text-[8px] font-cinzel text-[#FFE599] font-bold mt-1">DRAW</span>
                  </div>

                  {/* Draw Flight Animated Card */}
                  {drawingCardAnim && (
                    <motion.div
                      initial={{ scale: 0.6, y: -20, rotate: 15, opacity: 0 }}
                      animate={{ scale: 1, y: 70, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      className="absolute inset-0 z-30 w-16 h-22 rounded-xl bg-gradient-to-b from-[#FAF5EB] to-[#EADBC4] border-2 border-[#FFE599] shadow-2xl flex items-center justify-center"
                    >
                      <span className="text-lg animate-bounce">✨</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Discard / Active Slam Arena */}
              <div className="flex flex-col items-center relative">
                <span className="text-[9.5px] font-cinzel text-[#C5A059] mb-1 font-bold">
                  📜 弃牌堆 ({state.discardPile.length}张)
                </span>
                
                {slammingCardAnim ? (
                  <motion.div
                    initial={{ scale: 1.4, y: 50, rotate: -15 }}
                    animate={{ scale: [1.4, 1.05, 1], y: 0, rotate: 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className={`w-18 h-24 rounded-xl bg-gradient-to-b ${slammingCardAnim.artBg} border-3 border-[#FFE599] shadow-[0_0_25px_rgba(255,229,153,0.8)] p-1.5 flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-[#8C1D35] text-[#FFE599] flex items-center justify-center font-mono font-bold text-[10px]">
                        {slammingCardAnim.value}
                      </span>
                      <span className="text-sm">{slammingCardAnim.icon}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10.5px] font-bold font-serif text-[#FFFDF5] block leading-tight">
                        {slammingCardAnim.name.split(' · ')[0]}
                      </span>
                    </div>
                  </motion.div>
                ) : lastDiscarded ? (
                  <motion.div
                    key={lastDiscarded.id}
                    initial={{ scale: 0.85, y: -10, rotate: -8 }}
                    animate={{ scale: 1, y: 0, rotate: 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className={`w-18 h-24 rounded-xl bg-gradient-to-b ${lastDiscarded.artBg} border-2 border-[#D4AF37] shadow-xl p-1.5 flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-[#8C1D35] text-[#FFE599] flex items-center justify-center font-mono font-bold text-[10px]">
                        {lastDiscarded.value}
                      </span>
                      <span className="text-sm">{lastDiscarded.icon}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10.5px] font-bold font-serif text-[#FFFDF5] block leading-tight">
                        {lastDiscarded.name.split(' · ')[0]}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-18 h-24 rounded-xl border-2 border-dashed border-[#D4AF37]/40 bg-black/20 flex flex-col items-center justify-center text-center p-1 text-[#A8987E]">
                    <span className="text-xs font-cinzel">空置牌桌</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tactical Narrative Log on Felt */}
            <div className="mt-2 pt-2 border-t border-[#D4AF37]/20 flex items-center justify-center gap-1.5 text-[11px] font-serif text-[#FFE599] text-center relative z-10">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="font-bold">{log}</span>
            </div>

            {/* QUICK REACTION EMOJIS BAR (实时双向互动弹幕小气泡) */}
            <div className="mt-2 pt-2 border-t border-[#D4AF37]/15 flex items-center justify-between relative z-10">
              <span className="text-[9px] text-[#A8987E] font-cinzel">互动发弹幕:</span>
              <div className="flex gap-1">
                {['👀 偷瞄', '😏 别慌', '💖 爱你', '😱 别打公主', '⚡ 杀气'].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSendReaction(item)}
                    className="px-1.5 py-0.5 rounded-full bg-[#1F2E40] hover:bg-[#8C1D35] border border-[#D4AF37]/40 text-[9px] text-[#FFE599] transition-transform active:scale-90 cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pass & Play Masking Overlay (Only in offline mode) */}
          {!isOnlineMode && hideHand && !roundWinner && (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#182638] to-[#0D141C] text-center text-[#FFFDF5] space-y-3 mb-3 border-2 border-[#D4AF37] shadow-2xl">
              <span className="text-3xl block">💌</span>
              <h4 className="text-sm font-cinzel font-bold text-[#FFE599]">
                请将手机平稳转交给 {activePlayer === 'A' ? '👦 HE' : '👧 HER'}
              </h4>
              <p className="text-xs text-[#EADBC4] font-serif italic">
                “保持神秘 · 严防偷看对方手牌”
              </p>
              <button
                onClick={() => setHideHand(false)}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-cinzel font-bold tracking-wider cursor-pointer border-2 border-[#D4AF37] shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                我是本人 · 点击启封看牌 🔓
              </button>
            </div>
          )}

          {/* ========================================================
              FAN OF HAND CARDS (真实扇形手牌握持感)
          ======================================================== */}
          {(!hideHand || isOnlineMode) && !roundWinner && (
            <div className="space-y-1.5 mb-2">
              <div className="flex items-center justify-between text-[11px] text-[#8C7658] font-cinzel px-1">
                <span className="font-bold flex items-center gap-1">
                  🎴 你的手牌（轻触上拔 · 拍桌打出）：
                </span>
                <span>
                  {activeRole === 'A'
                    ? (state.protectedA ? '🛡️ 护身符保护中' : '')
                    : (state.protectedB ? '🛡️ 护身符保护中' : '')}
                </span>
              </div>

              {/* Overlapping Hand Fan Container */}
              <div className="relative h-56 flex items-center justify-center pt-2">
                {currentHandCards.map((card, idx) => {
                  const isSelected = selectedCardId === card.id || currentHandCards.length === 1;
                  const defaultRotate = idx === 0 ? -6 : 6;
                  const defaultX = idx === 0 ? -38 : 38;

                  return (
                    <motion.div
                      key={`${card.id}-${idx}`}
                      animate={{
                        rotate: isSelected ? 0 : defaultRotate,
                        y: isSelected ? -24 : 0,
                        x: isSelected ? (idx === 0 ? -24 : 24) : defaultX,
                        scale: isSelected ? 1.08 : 1,
                        zIndex: isSelected ? 30 : idx === 1 ? 20 : 10
                      }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                      onClick={() => {
                        setSelectedCardId(card.id);
                        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                          try {
                            navigator.vibrate([15]);
                          } catch {}
                        }
                      }}
                      className={`absolute w-44 h-50 rounded-2xl p-2.5 bg-gradient-to-b ${card.artBg} border-3 ${
                        isSelected ? 'border-[#FFE599] shadow-[0_12px_28px_rgba(212,175,55,0.4)]' : 'border-[#D4AF37] shadow-xl'
                      } text-left flex flex-col justify-between cursor-pointer select-none transition-colors overflow-hidden`}
                    >
                      {/* Top Ribbon */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="w-7 h-7 rounded-full bg-[#8C1D35] text-[#FFE599] flex items-center justify-center font-mono font-bold text-sm shadow-xs border border-[#FFE599]/60">
                            {card.value}
                          </span>
                          <span className="text-[10px] font-cinzel text-[#FFE599] font-bold">
                            {card.roman}
                          </span>
                        </div>
                        <span className={`text-[9.5px] font-cinzel font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-2xs ${card.badgeColor}`}>
                          {card.effect}
                        </span>
                      </div>

                      {/* Center Artwork Emblem */}
                      <div className="my-auto text-center flex flex-col items-center justify-center">
                        <span className="text-3xl filter drop-shadow-md mb-0.5">
                          {card.icon}
                        </span>
                        <h4 className="text-sm font-bold text-[#FFFDF5] font-serif drop-shadow-xs">
                          {card.name}
                        </h4>
                      </div>

                      {/* Bottom Rule Desc & Fling Action Button */}
                      <div>
                        <p className="text-[9.5px] text-[#F3E5AB] font-serif leading-tight line-clamp-2 opacity-95">
                          {card.desc}
                        </p>
                        {isSelected && isMyTurn && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayCard(card);
                            }}
                            className="w-full mt-1.5 py-1 rounded-lg bg-gradient-to-r from-[#8C1D35] to-[#B32645] border border-[#FFE599] text-[#FFFDF5] text-[10px] font-cinzel font-bold text-center shadow-md active:scale-95 transition-all flex items-center justify-center gap-1"
                          >
                            <Send className="w-3 h-3 text-[#FFE599]" />
                            <span>⚡ 拍桌打出此牌</span>
                          </motion.button>
                        )}
                        {isSelected && !isMyTurn && (
                          <div className="w-full mt-1.5 py-1 rounded-lg bg-black/40 border border-white/20 text-[#A8987E] text-[9.5px] font-serif text-center">
                            等待对方行动中...
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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
                className="p-3.5 rounded-2xl bg-[#182638] border-2 border-[#D4AF37] text-[#FFFDF5] mb-3 text-center space-y-1.5 shadow-xl"
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel text-[#FFE599] font-bold">
                  <Eye className="w-4 h-4 text-[#60A5FA]" />
                  <span>【牧师 · 窥心】探察结果</span>
                </div>
                <p className="text-xs font-serif">
                  对方此刻手里正握着的手牌是：
                  <strong className="text-[#FFE599] text-sm ml-1 font-mono">
                    [{peekingCard.value}点] {peekingCard.name}
                  </strong>
                </p>
                <button
                  onClick={() => setPeekingCard(null)}
                  className="px-4 py-1 rounded-lg bg-[#8C1D35] text-[10.5px] font-serif cursor-pointer border border-[#D4AF37]/50 shadow-xs"
                >
                  我知道了 · 闭上心眼 👁️
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Guess Card Modal (Guard Effect) */}
          <AnimatePresence>
            {showGuessModal && (
              <div className="p-3.5 rounded-2xl bg-[#111A27] border-2 border-[#D4AF37] text-[#FFFDF5] mb-3 space-y-2 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-cinzel text-[#FFE599] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-[#FDE047]" />
                    【卫兵魔杖】指定猜一张手牌：
                  </span>
                </div>
                <p className="text-[10px] text-[#A8987E] font-serif">
                  猜中对方手牌即可一击淘汰对方（不可猜卫兵自身）：
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {LOVE_LETTER_CARDS.filter((c) => c.value > 1).map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleConfirmGuess(c.value)}
                      className="py-1.5 px-1 rounded-lg bg-[#182638] hover:bg-[#8C1D35] text-[10px] font-serif truncate border border-[#D4AF37]/40 text-[#FFE599] cursor-pointer shadow-xs active:scale-95 transition-all"
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
              className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF5EB] to-[#FFFDF9] border-2 border-[#D4AF37] text-center space-y-2 shadow-md mb-3"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel font-bold text-[#8C1D35]">
                <Trophy className="w-4 h-4 text-[#D4AF37]" />
                <span>本轮王室决斗结案！</span>
              </div>
              <p className="text-xs font-serif text-[#2C241E] font-bold">
                {log}
              </p>
              <div className="pt-1">
                <button
                  onClick={handleNextRound}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-cinzel font-bold tracking-wider cursor-pointer border border-[#D4AF37]/50 shadow-md"
                >
                  开启下一轮对决 ➡️
                </button>
              </div>
            </motion.div>
          )}

          {/* Card Glossary Modal */}
          <AnimatePresence>
            {showRules && (
              <div className="fixed inset-0 z-50 bg-[#111A27]/80 flex items-center justify-center p-4">
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
                          <span className="flex items-center gap-1">
                            <span>{c.icon}</span>
                            <span>{c.value}点 · {c.name} ({c.count}张)</span>
                          </span>
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
    </ClickSpark>
  );
};
