import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Camera, Award, Sparkles } from 'lucide-react';

export type NavTab = 'home' | 'today' | 'rating' | 'fun';

interface PillNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const PillNav: React.FC<PillNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'home' as NavTab, label: '想念', icon: Heart },
    { id: 'today' as NavTab, label: '今日', icon: Camera },
    { id: 'rating' as NavTab, label: '评分', icon: Award },
    { id: 'fun' as NavTab, label: '情趣', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="glass-pill rounded-full p-1.5 flex items-center gap-1 shadow-lg border border-white/90">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 select-none ${
                isActive ? 'text-rose-600' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white rounded-full shadow-xs border border-rose-100"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
