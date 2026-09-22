import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Compass, Camera, Scroll, Sparkles, LucideIcon } from 'lucide-react';

export type NavTab = 'seal' | 'compass' | 'today' | 'rating' | 'fun';

interface DockItemProps {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  isActive: boolean;
  onClick: () => void;
}

const DockItem: React.FC<DockItemProps> = ({ icon: Icon, label, sublabel, isActive, onClick }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`relative w-[60px] sm:w-[68px] h-[56px] rounded-2xl flex flex-col items-center justify-center select-none px-1 transition-transform duration-150 ${
        isActive ? 'text-[#F5E8BE] font-bold' : 'text-[#A8987E] active:text-[#FAF5EB]'
      }`}
      style={{ transform: 'translateZ(0)' }}
    >
      {isActive && (
        <motion.div
          layoutId="dock-active-bg"
          className="absolute inset-1 rounded-xl bg-[#8C1D35] border border-[#D4AF37]/50 shadow-[0_3px_12px_rgba(140,29,53,0.45)] -z-10"
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          style={{ transform: 'translateZ(0)' }}
        />
      )}
      <Icon className={`w-4 h-4 transition-transform duration-150 ${isActive ? 'scale-110 text-[#F5E8BE]' : ''}`} />
      <span className="text-[9.5px] mt-1 font-bold tracking-wider font-cinzel leading-none">{label}</span>
      <span className="text-[8.5px] mt-0.5 font-serif leading-none opacity-80">{sublabel}</span>
    </motion.button>
  );
};

interface DockNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const DockNav: React.FC<DockNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'seal' as NavTab, label: 'SEAL', sublabel: '信笺', icon: Heart },
    { id: 'compass' as NavTab, label: 'STAR', sublabel: '星轨', icon: Compass },
    { id: 'today' as NavTab, label: 'MOMENT', sublabel: '画像', icon: Camera },
    { id: 'rating' as NavTab, label: 'SCROLL', sublabel: '卷轴', icon: Scroll },
    { id: 'fun' as NavTab, label: 'TRIAL', sublabel: '试炼', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw]" style={{ transform: 'translate3d(-50%, 0, 0)' }}>
      <div
        className="rounded-3xl px-1.5 py-1.5 flex items-center gap-0.5 sm:gap-1 shadow-[0_12px_32px_rgba(15,23,42,0.4)] border border-[#D4AF37]/40 bg-[#162132]"
        style={{ transform: 'translateZ(0)' }}
      >
        {tabs.map((tab) => (
          <DockItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            sublabel={tab.sublabel}
            isActive={activeTab === tab.id}
            onClick={() => onChangeTab(tab.id)}
          />
        ))}
      </div>
    </div>
  );
};
