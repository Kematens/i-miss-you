import React, { useState } from 'react';

interface Spark {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

interface ClickSparkProps {
  children: React.ReactNode;
  sparkColors?: string[];
  sparkCount?: number;
  className?: string;
}

export const ClickSpark: React.FC<ClickSparkProps> = ({
  children,
  sparkColors = ['#fda4af', '#f43f5e', '#fb7185', '#fed7aa', '#f9a8d4'],
  sparkCount = 8,
  className = ''
}) => {
  const [sparks, setSparks] = useState<Spark[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const newSparks: Spark[] = Array.from({ length: sparkCount }).map((_, i) => {
      const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5);
      const distance = 30 + Math.random() * 40;
      return {
        id: Date.now() + i,
        x: clickX + Math.cos(angle) * distance,
        y: clickY + Math.sin(angle) * distance,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        size: 10 + Math.random() * 8,
        rotation: Math.random() * 360
      };
    });

    setSparks((prev) => [...prev, ...newSparks]);

    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !newSparks.some((ns) => ns.id === s.id)));
    }, 700);
  };

  return (
    <div className={`relative overflow-visible ${className}`} onClick={handleClick}>
      {children}
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{
            left: `${spark.x}px`,
            top: `${spark.y}px`,
            fontSize: `${spark.size}px`,
            color: spark.color,
            animationDuration: '650ms',
            animationIterationCount: '1',
          }}
        >
          ✨
        </span>
      ))}
    </div>
  );
};
