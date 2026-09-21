import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Heart, Compass, Camera, Scroll, Sparkles, LucideIcon } from 'lucide-react';

export type NavTab = 'seal' | 'compass' | 'today' | 'rating' | 'fun';

interface DockItemProps {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  isActive: boolean;
  onClick: () => void;
  mouseX: ReturnType<typeof useMotionValue<number>>;
}

const DockItem: React.FC<DockItemProps> = ({ icon: Icon, label, sublabel, isActive, onClick, mouseX }) => {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Balanced scaling for 5-item mobile dock
  const widthSync = useTransform(distance, [-70, 0, 70], [56, 74, 56]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 220, damping: 18 });

  return (
    <motion.button
      ref={ref}
      style={{ width }}
      onClick={onClick}
      className={`relative h-[56px] rounded-2xl flex flex-col items-center justify-center transition-colors duration-200 select-none px-1 ${
        isActive ? 'text-[#F5E8BE] font-bold' : 'text-[#A8987E] hover:text-[#FAF5EB]'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="dock-active-bg"
          className="absolute inset-1 rounded-xl bg-[#8C1D35] border border-[#D4AF37]/50 shadow-[0_3px_12px_rgba(140,29,53,0.45)] -z-10"
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        />
      )}
      <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110 text-[#F5E8BE]' : ''}`} />
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
  const mouseX = useMotionValue(Infinity);

  const tabs = [
    { id: 'seal' as NavTab, label: 'SEAL', sublabel: '信笺', icon: Heart },
    { id: 'compass' as NavTab, label: 'STAR', sublabel: '星轨', icon: Compass },
    { id: 'today' as NavTab, label: 'MOMENT', sublabel: '画像', icon: Camera },
    { id: 'rating' as NavTab, label: 'SCROLL', sublabel: '卷轴', icon: Scroll },
    { id: 'fun' as NavTab, label: 'TRIAL', sublabel: '试炼', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw]">
      <div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="rounded-3xl px-1.5 py-1.5 flex items-center gap-0.5 sm:gap-1 shadow-[0_12px_32px_rgba(15,23,42,0.35)] border border-[#D4AF37]/40 bg-[#182435]/95 backdrop-blur-md"
      >
        {tabs.map((tab) => (
          <DockItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            sublabel={tab.sublabel}
            isActive={activeTab === tab.id}
            onClick={() => onChangeTab(tab.id)}
            mouseX={mouseX}
          />
        ))}
      </div>
    </div>
  );
};
