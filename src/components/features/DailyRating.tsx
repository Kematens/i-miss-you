import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scroll, Heart, Feather, Check } from 'lucide-react';
import { ElasticSlider } from '../animations/ElasticSlider';
import { BlurText } from '../animations/BlurText';
import { SpotlightCard } from '../animations/SpotlightCard';

interface RatingRecord {
  id: string;
  date: string;
  score: number;
  moodTag: string;
  comment: string;
}

export const DailyRating: React.FC = () => {
  const [score, setScore] = useState(96);
  const [selectedTag, setSelectedTag] = useState('体贴入微');
  const [comment, setComment] = useState('');
  const [submittedToday, setSubmittedToday] = useState(false);
  const [history, setHistory] = useState<RatingRecord[]>([
    {
      id: '1',
      date: '昨日手札',
      score: 98,
      moodTag: '体贴入微',
      comment: '夜深时主动煮了热饮并剥好了水果，举止温存，态度诚挚。'
    },
    {
      id: '2',
      date: '前日手札',
      score: 91,
      moodTag: '值得表扬',
      comment: '准时赴约，并在散步时细心披上外套，特此载入卷轴。'
    }
  ]);

  const tags = [
    '体贴入微',
    '耐心温柔',
    '准时守约',
    '主动分担',
    '略有粗心',
    '值得表扬'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newRecord: RatingRecord = {
      id: Date.now().toString(),
      date: '今日手札',
      score,
      moodTag: selectedTag,
      comment
    };

    setHistory([newRecord, ...history]);
    setSubmittedToday(true);
  };

  const getScoreVerdict = (s: number) => {
    if (s >= 95) return '卓越 · 恪守温存之德';
    if (s >= 85) return '优良 · 默契如初';
    if (s >= 70) return '尚可 · 需多加关照';
    return '需促膝长谈调整';
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 font-serif">
      <SpotlightCard className="p-5 sm:p-6" spotlightColor="rgba(212, 175, 55, 0.2)">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#EADBC4]/70 border border-[#D4AF37]/40 text-[#8C1D35] flex items-center justify-center shadow-xs">
              <Scroll className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#2C241E] font-cinzel tracking-wider">
                CHRONICLE · 羊皮卷评语
              </h2>
              <p className="text-[11px] text-[#8C7658]">
                心动刻度 · 每日评鉴手札
              </p>
            </div>
          </div>
          <span className="text-[10px] text-[#C5A059] font-cinzel tracking-wider">
            RECORD
          </span>
        </div>

        {submittedToday ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-12 h-12 rounded-full bg-[#EADBC4]/60 text-[#8C1D35] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
              <Check className="w-6 h-6 text-[#C5A059]" />
            </div>
            <h3 className="text-sm font-bold text-[#2C241E] font-cinzel tracking-wider mb-1">
              CHRONICLE SEALED · 已载入手札
            </h3>
            <div className="inline-block px-3.5 py-1 rounded-full bg-[#F4EBD9] text-[#8C1D35] border border-[#D9C89E] text-xs font-medium my-1.5">
              评定 {score} 分 · {selectedTag}
            </div>
            <p className="text-xs text-[#665440] max-w-xs mx-auto mt-1 leading-relaxed italic">
              “{comment}”
            </p>
            <button
              onClick={() => setSubmittedToday(false)}
              className="mt-3.5 text-[11px] text-[#8C7658] hover:text-[#8C1D35] underline"
            >
              重新提笔修改
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Score Slider */}
            <div>
              <div className="flex justify-between items-baseline mb-0.5">
                <label className="text-xs text-[#524336] flex items-center gap-1 font-medium font-cinzel tracking-wider">
                  MERIT GAUGE · 心动刻度
                </label>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#8C1D35] font-mono tracking-tight">
                    {score}
                  </span>
                  <span className="text-xs text-[#8C7658] font-cinzel ml-0.5">PTS</span>
                </div>
              </div>

              <ElasticSlider
                value={score}
                onChange={setScore}
                min={0}
                max={100}
                step={1}
              />

              <div className="text-center">
                <span className="text-[11px] text-[#7A6750] bg-[#F4EBD9] px-3 py-0.5 rounded-full border border-[#D9C89E] inline-block font-serif">
                  {getScoreVerdict(score)}
                </span>
              </div>
            </div>

            {/* Badges */}
            <div>
              <label className="block text-[11px] text-[#8C7658] mb-1.5 font-medium">
                授予勋章印记
              </label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`text-[11px] px-3 py-1 rounded-xl transition-all font-serif ${
                      selectedTag === tag
                        ? 'bg-[#8C1D35] text-[#F5EBD9] font-medium shadow-xs border border-[#8C1D35]'
                        : 'bg-[#FCF9F2] text-[#665440] hover:bg-[#F4EBD9] border border-[#D9C89E]/70'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-[11px] text-[#8C7658] mb-1 font-medium flex items-center gap-1">
                <Feather className="w-3 h-3 text-[#C5A059]" />
                羽毛笔评语手札
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="以羽毛笔书写今日他在心头留下的波澜..."
                rows={3}
                className="w-full text-xs p-3 rounded-2xl border border-[#D9C89E] focus:outline-none focus:ring-1 focus:ring-[#C5A059] bg-[#FCF9F2] resize-none text-[#2C241E] placeholder:text-[#A8987E] font-serif leading-relaxed"
                maxLength={200}
              />
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!comment.trim()}
              className={`w-full py-2.5 rounded-2xl font-cinzel text-xs tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                comment.trim()
                  ? 'bg-gradient-to-r from-[#A51D38] to-[#7D122B] text-[#F5EBD9] cursor-pointer shadow-[#7D122B]/20 border border-[#D4AF37]/40'
                  : 'bg-[#EADBC4]/50 text-[#A8987E] cursor-not-allowed border border-transparent'
              }`}
            >
              <Heart className="w-3 h-3 fill-current text-[#F5E8BE]" />
              SEAL INTO CHRONICLE · 盖戳入卷
            </motion.button>
          </form>
        )}

        {/* History */}
        <div className="mt-5 pt-3.5 border-t border-[#E8DCB8]">
          <h4 className="text-[11px] font-cinzel tracking-wider text-[#8C7658] mb-2.5">
            PAST CHRONICLES · 往期卷轴手札
          </h4>
          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
            {history.map((record) => (
              <div
                key={record.id}
                className="p-3 rounded-2xl bg-[#FAF5EB] border border-[#E8DCB8] text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#3D3025] text-[11px] font-cinzel">{record.date}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EADBC4]/70 text-[#8C1D35] border border-[#D9C89E]/50">
                      {record.moodTag}
                    </span>
                  </div>
                  <span className="font-bold text-[#8C1D35] font-mono text-xs">
                    {record.score} PTS
                  </span>
                </div>
                <p className="text-[#665440] text-[11px] leading-relaxed italic">
                  <BlurText text={record.comment} delay={20} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
};
