import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Feather, Heart, Sparkles, Check, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ElasticSlider } from '../animations/ElasticSlider';
import { DecayCard } from '../animations/DecayCard';
import { ClickSpark } from '../animations/ClickSpark';
import { ShinyText } from '../animations/ShinyText';

interface RatingRecord {
  id: string;
  date: string;
  score: number;
  moodTag: string;
  comment: string;
}

export const DailyRating: React.FC = () => {
  const [score, setScore] = useState(96);
  const [selectedTag, setSelectedTag] = useState('温存之德');
  const [comment, setComment] = useState('');
  const [submittedToday, setSubmittedToday] = useState(false);
  const [history, setHistory] = useState<RatingRecord[]>([
    {
      id: '1',
      date: '昨日案卷',
      score: 98,
      moodTag: '温存之德',
      comment: '夜深时主动煮了热饮并剥好温热水果，举止温存，态度诚挚。'
    },
    {
      id: '2',
      date: '前日案卷',
      score: 91,
      moodTag: '值得表彰',
      comment: '准时赴约，并在散步迎风时细心披上外套，特此载入案卷。'
    }
  ]);

  const MEDAL_TAGS = [
    { label: '温存之德', icon: '⚜️', desc: '体贴入微' },
    { label: '恪守契约', icon: '📜', desc: '准时守约' },
    { label: '耐心至极', icon: '👑', desc: '温柔包容' },
    { label: '分担家事', icon: '🍵', desc: '主动勤勉' },
    { label: '略有粗心', icon: '⚡', desc: '需加关照' },
    { label: '值得表彰', icon: '💎', desc: '心动满分' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newRecord: RatingRecord = {
      id: Date.now().toString(),
      date: '今日案卷',
      score,
      moodTag: selectedTag,
      comment
    };

    setHistory([newRecord, ...history]);
    setSubmittedToday(true);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 40, 80]);
      } catch {}
    }

    confetti({
      particleCount: 40,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#D4AF37', '#FFF2CE', '#AA822A', '#8C1D35']
    });
  };

  // O.W.L.s & N.E.W.T.s Hogwarts Official 6-Grade Evaluation System
  const getScoreVerdict = (s: number) => {
    if (s >= 95) {
      return {
        grade: 'O · OUTSTANDING',
        title: '优秀（Outstanding）',
        quote: '“超迈绝伦 · 恪守温存之德，授予梅林爵士一级勋章”',
        color: '#8C1D35'
      };
    }
    if (s >= 85) {
      return {
        grade: 'E · EXCEEDS EXPECTATIONS',
        title: '良好（Exceeds Expectations）',
        quote: '“超出预期 · 默契深切，值得霍格沃茨最高赞赏”',
        color: '#9E6B20'
      };
    }
    if (s >= 75) {
      return {
        grade: 'A · ACCEPTABLE',
        title: '及格（Acceptable）',
        quote: '“合乎心意 · 步履平稳，温情常伴日常之间”',
        color: '#556B2F'
      };
    }
    if (s >= 60) {
      return {
        grade: 'P · POOR',
        title: '欠佳（Poor）',
        quote: '“稍欠体贴 · 今日略有粗心，需备黄油啤酒促膝长谈”',
        color: '#8B4513'
      };
    }
    if (s >= 40) {
      return {
        grade: 'D · DREADFUL',
        title: '糟糕（Dreadful）',
        quote: '“令人失望 · 惹恼了女巫，需诚挚道歉并奉上蜂蜜公爵甜食”',
        color: '#701C1C'
      };
    }
    return {
      grade: 'T · TROLL',
      title: '山怪（Troll）',
      quote: '“顽钝如巨怪 · 魔法天平倾斜，速速施展修复咒与爱的魔药”',
      color: '#4A0E17'
    };
  };

  const currentVerdict = getScoreVerdict(score);

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 font-serif select-none space-y-4">
      
      {/* ========================================================
          1. VICTORIAN BRASS MERIT GAUGE CONTAINER (黄铜心动量表)
      ======================================================== */}
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-5 sm:p-6 text-[#2C241E] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D9C89E]/60 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/50 text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4 text-[#FFE599]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                  MERIT GAUGE · 心动量规
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#8C1D35] font-cinzel border border-[#D4AF37]/30">
                  DAILY EVALUATION
                </span>
              </div>
              <h2 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                学院级每日打分与考评手札
              </h2>
            </div>
          </div>
          <span className="text-[10px] text-[#C5A059] font-cinzel tracking-wider font-bold">
            CHRONICLE
          </span>
        </div>

        {submittedToday ? (
          /* ====================================================
              SUBMITTED HERO STATE (已载入案卷状态)
          ==================================================== */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-3"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#8C1D35] to-[#5C1021] text-[#FFE599] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-md">
              <Check className="w-7 h-7 text-[#FFE599]" />
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-[#2C241E] font-cinzel tracking-wider">
                MERIT CONFERRED · 勋章已载入案卷
              </h3>
              <p className="text-[11px] text-[#8C7658] mt-0.5">
                今日心动考核已正式加盖火漆印信
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF5EB] text-[#8C1D35] border border-[#D4AF37]/60 text-xs font-bold my-1 shadow-2xs">
              <span>{score} PTS</span>
              <span>·</span>
              <span>{currentVerdict.grade}</span>
              <span>·</span>
              <span>{selectedTag}</span>
            </div>

            <p className="text-xs text-[#524336] max-w-xs mx-auto leading-relaxed italic bg-[#FAF6EE] p-3 rounded-2xl border border-[#D9C89E]/60">
              “{comment}”
            </p>

            <button
              onClick={() => setSubmittedToday(false)}
              className="mt-2 text-[11px] text-[#8C7658] hover:text-[#8C1D35] underline cursor-pointer"
            >
              重新提笔修改
            </button>
          </motion.div>
        ) : (
          /* ====================================================
              INTERACTIVE GAUGE FORM (交互式黄铜量表表单)
          ==================================================== */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Score Gauge Dial (数值展示与刻度) */}
            <div className="p-3.5 rounded-2xl bg-[#FAF5EB] border border-[#D4AF37]/50 shadow-2xs">
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-[10px] text-[#8C7658] flex items-center gap-1 font-bold font-cinzel tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-[#8C1D35]" />
                  RUBY MERIT DIAL · 红宝石刻度
                </label>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-bold text-[#8C1D35] tracking-tight">
                    {score}
                  </span>
                  <span className="text-[10px] text-[#8C7658] font-cinzel font-bold">
                    / 100 PTS
                  </span>
                </div>
              </div>

              {/* Elastic Rubberband Brass Slider */}
              <ElasticSlider
                value={score}
                onChange={setScore}
                min={0}
                max={100}
                step={1}
              />

              {/* Verdict Brass Banner - O.W.L.s Harry Potter Grade Banner */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-[#FFFDF9] border border-[#D4AF37]/50 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-cinzel font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8C1D35]/10 text-[#8C1D35] border border-[#8C1D35]/20">
                    O.W.L. 等级：{currentVerdict.grade}
                  </span>
                  <span className="text-[10px] font-serif font-bold text-[#2C241E]">
                    {currentVerdict.title}
                  </span>
                </div>
                <p className="text-[10.5px] text-[#7A6750] font-serif italic text-center">
                  <ShinyText text={currentVerdict.quote} speed={3.5} />
                </p>
              </div>
            </div>

            {/* 2. Medal Tags Badges (手作勋章标签) */}
            <div>
              <label className="block text-[11px] text-[#8C7658] mb-1.5 font-bold font-cinzel tracking-wider">
                CONFER MEDAL · 授予今日心动勋章
              </label>
              <div className="grid grid-cols-3 gap-2">
                {MEDAL_TAGS.map((tag) => {
                  const isSelected = selectedTag === tag.label;
                  return (
                    <ClickSpark key={tag.label} sparkColors={['#D4AF37', '#FFF2CE', '#8C1D35']} sparkCount={6}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTag(tag.label);
                          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                            try {
                              navigator.vibrate([15]);
                            } catch {}
                          }
                        }}
                        className={`w-full py-2 px-2 rounded-xl text-center transition-all font-serif cursor-pointer border ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] font-bold shadow-sm border-[#D4AF37]'
                            : 'bg-[#FAF6EE] text-[#665440] hover:bg-[#F4EBD9] border-[#D9C89E]/60'
                        }`}
                      >
                        <div className="text-sm mb-0.5">{tag.icon}</div>
                        <div className="text-[11px] leading-tight font-bold">{tag.label}</div>
                        <div className={`text-[8.5px] mt-0.5 ${isSelected ? 'text-[#FFE599]' : 'text-[#8C7658]'}`}>
                          {tag.desc}
                        </div>
                      </button>
                    </ClickSpark>
                  );
                })}
              </div>
            </div>

            {/* 3. Quill Handwritten Chronicle (羽毛笔评语手札) */}
            <div>
              <label className="block text-[11px] text-[#8C7658] mb-1.5 font-bold font-cinzel tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Feather className="w-3.5 h-3.5 text-[#C5A059]" />
                  QUILL CHRONICLE · 今日案卷手札
                </span>
                <span className="text-[9px] text-[#A8987E] font-normal">
                  限 200 字
                </span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="以羽毛笔书写今日他在心头留下的波澜与感动..."
                rows={3}
                className="w-full text-xs p-3 rounded-2xl border border-[#D9C89E] focus:outline-none focus:ring-1 focus:ring-[#C5A059] bg-[#FFFDF9] resize-none text-[#2C241E] placeholder:text-[#A8987E] font-serif leading-relaxed"
                maxLength={200}
              />
            </div>

            {/* 4. Confer & Seal Button */}
            <ClickSpark sparkColors={['#FFE599', '#D4AF37', '#FFF2CE', '#8C1D35']} sparkCount={10}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!comment.trim()}
                className={`w-full py-2.5 rounded-2xl font-cinzel text-xs tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 shadow-sm border ${
                  comment.trim()
                    ? 'bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] cursor-pointer shadow-[#7D122B]/20 border-[#D4AF37]/50 hover:brightness-105'
                    : 'bg-[#EADBC4]/50 text-[#A8987E] cursor-not-allowed border-transparent'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current text-[#FFE599]" />
                <span>SEAL & CONFER · 加盖印信入卷</span>
              </motion.button>
            </ClickSpark>
          </form>
        )}

        {/* ========================================================
            2. PAST ARCHIVE DRAWER (往期手札案卷库 - 带 DecayCard 3D 阻尼)
        ======================================================== */}
        <div className="mt-5 pt-3.5 border-t border-[#E8DCB8]">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-[10px] font-cinzel tracking-[0.18em] text-[#8C7658] font-bold">
              HISTORIC CHRONICLES · 往期案卷手札
            </h4>
            <span className="text-[9px] font-serif text-[#A8987E]">
              共存 {history.length} 篇
            </span>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            <AnimatePresence>
              {history.map((record) => (
                <DecayCard key={record.id} tiltFactor={8}>
                  <div className="p-3.5 rounded-2xl bg-[#FAF5EB] border border-[#D4AF37]/45 text-xs shadow-2xs relative overflow-hidden group cursor-pointer hover:border-[#D4AF37]">
                    
                    {/* Header line of the archive folio */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2C241E] text-[11px] font-cinzel">
                          {record.date}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#8C1D35] font-cinzel font-bold border border-[#D4AF37]/40">
                          {getScoreVerdict(record.score).grade.split(' · ')[0]}
                        </span>
                        <span className="text-[9.5px] px-2 py-0.2 rounded-md bg-[#8C1D35]/10 text-[#8C1D35] border border-[#8C1D35]/25 font-bold font-serif">
                          {record.moodTag}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 font-mono font-bold text-xs text-[#8C1D35]">
                        <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                        <span>{record.score} PTS</span>
                      </div>
                    </div>

                    {/* Comment with classic quotation */}
                    <p className="text-[#524336] text-[11px] leading-relaxed italic">
                      “{record.comment}”
                    </p>
                  </div>
                </DecayCard>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
