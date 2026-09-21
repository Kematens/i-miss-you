import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpotlightCard } from '../animations/SpotlightCard';

interface Question {
  id: number;
  title: string;
  optionA: string;
  optionB: string;
  partnerChoice: 'A' | 'B';
}

export const CoupleDuel: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [myChoice, setMyChoice] = useState<'A' | 'B' | null>(null);

  const questions: Question[] = [
    {
      id: 1,
      title: '壁炉火光摇曳的冬夜，更期盼哪种共处时光？',
      optionA: '并肩披着毯子翻看同一本书或电影',
      optionB: '在烛光下温一壶热茶轻声漫谈心事',
      partnerChoice: 'A'
    },
    {
      id: 2,
      title: '遇到迷惘与心事时，更倾向如何寻求依托？',
      optionA: '静默相拥片刻，无需过多言语',
      optionB: '坦诚促膝长谈，彼此剖白心意',
      partnerChoice: 'A'
    }
  ];

  const q = questions[currentQuestionIndex];
  const isRevealed = myChoice !== null;
  const isMatch = isRevealed && myChoice === q.partnerChoice;

  const handleSelect = (choice: 'A' | 'B') => {
    setMyChoice(choice);
    if (choice === q.partnerChoice) {
      confetti({
        particleCount: 24,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#D4AF37', '#F5E8BE', '#C5A059', '#8C1D35']
      });
    }
  };

  const handleNextQuestion = () => {
    setMyChoice(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 font-serif">
      <SpotlightCard className="p-5 sm:p-6" spotlightColor="rgba(212, 175, 55, 0.2)">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#EADBC4]/70 border border-[#D4AF37]/40 text-[#8C1D35] flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#2C241E] font-cinzel tracking-wider">
                SOUL TRIAL · 灵魂试炼
              </h2>
              <p className="text-[11px] text-[#8C7658]">
                双人心念投掷 · 探察默契契合
              </p>
            </div>
          </div>
          <span className="text-[10px] text-[#C5A059] font-cinzel tracking-wider">
            TRIAL 0{q.id}
          </span>
        </div>

        {/* Question Title */}
        <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#D9C89E] mb-3 text-center shadow-2xs">
          <h3 className="text-xs font-serif font-bold text-[#3D3025] leading-relaxed">
            {q.title}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {/* Option A */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => !isRevealed && handleSelect('A')}
            disabled={isRevealed}
            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all font-serif ${
              myChoice === 'A'
                ? 'bg-[#F4EBD9] border-[#C5A059] shadow-xs'
                : 'bg-[#FCF9F2] border-[#E8DCB8] hover:border-[#C5A059]'
            }`}
          >
            <span className="text-xs text-[#3D3025]">
              {q.optionA}
            </span>
            <div className="flex items-center gap-1.5">
              {isRevealed && q.partnerChoice === 'A' && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#182435] text-[#F5EBD9] font-cinzel tracking-wider">
                  HIS CHOICE
                </span>
              )}
              {myChoice === 'A' && (
                <span className="w-4 h-4 rounded-full bg-[#8C1D35] text-[#F5E8BE] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
          </motion.button>

          {/* Option B */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => !isRevealed && handleSelect('B')}
            disabled={isRevealed}
            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all font-serif ${
              myChoice === 'B'
                ? 'bg-[#F4EBD9] border-[#C5A059] shadow-xs'
                : 'bg-[#FCF9F2] border-[#E8DCB8] hover:border-[#C5A059]'
            }`}
          >
            <span className="text-xs text-[#3D3025]">
              {q.optionB}
            </span>
            <div className="flex items-center gap-1.5">
              {isRevealed && q.partnerChoice === 'B' && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#182435] text-[#F5EBD9] font-cinzel tracking-wider">
                  HIS CHOICE
                </span>
              )}
              {myChoice === 'B' && (
                <span className="w-4 h-4 rounded-full bg-[#8C1D35] text-[#F5E8BE] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
          </motion.button>
        </div>

        {/* Reveal Result Banner */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 p-3 rounded-2xl border text-center font-serif ${
                isMatch
                  ? 'bg-[#FAF5EB] border-[#D4AF37] text-[#8C1D35] shadow-xs'
                  : 'bg-[#FCF9F2] border-[#E8DCB8] text-[#665440]'
              }`}
            >
              {isMatch ? (
                <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel tracking-wider font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>HARMONY REACHED · 心意冥合 100%</span>
                </div>
              ) : (
                <div className="text-xs font-serif">
                  各有异趣 · 恰是彼此深邃之处
                </div>
              )}

              <button
                onClick={handleNextQuestion}
                className="mt-1.5 text-[10px] text-[#8C7658] hover:text-[#8C1D35] font-cinzel tracking-wider underline"
              >
                NEXT TRIAL ➡️
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </SpotlightCard>
    </div>
  );
};
