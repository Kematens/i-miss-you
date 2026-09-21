import React from 'react';

interface SoftAuroraProps {
  className?: string;
}

export const SoftAurora: React.FC<SoftAuroraProps> = ({ className = '' }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 ${className}`}>
      {/* Candlelight Amber Warmth Glow */}
      <div 
        className="absolute -top-[15%] -left-[10%] w-[75vw] h-[75vw] max-w-[650px] max-h-[650px] rounded-full opacity-40 filter blur-[100px] animate-candle-flicker"
        style={{
          background: 'radial-gradient(circle, rgba(234,179,8,0.35) 0%, rgba(217,119,6,0.18) 50%, transparent 75%)',
        }}
      />

      {/* Hogwarts Midnight Oxford Blue Ambient Corner */}
      <div 
        className="absolute top-[20%] -right-[15%] w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] rounded-full opacity-25 filter blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(30,41,59,0.3) 0%, rgba(15,23,42,0.1) 60%, transparent 80%)',
          animation: 'float 14s ease-in-out infinite alternate'
        }}
      />

      {/* Deep Burgundy Wax Seal Warmth */}
      <div 
        className="absolute -bottom-[20%] left-[15%] w-[75vw] h-[75vw] max-w-[650px] max-h-[650px] rounded-full opacity-25 filter blur-[110px]"
        style={{
          background: 'radial-gradient(circle, rgba(140,29,53,0.3) 0%, rgba(107,18,38,0.1) 60%, transparent 80%)',
          animation: 'float 12s ease-in-out infinite alternate-reverse'
        }}
      />

      {/* Antique Parchment Paper Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.038] mix-blend-multiply pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Subtle Vignette along the edges */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 100px rgba(78, 52, 28, 0.08)'
        }}
      />
    </div>
  );
};
