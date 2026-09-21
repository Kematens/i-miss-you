import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const BOARD_SIZE = 8; // Compact 8x8 Gobang for mobile screens

type CellValue = null | 'obsidian' | 'silver';

export const RuneChess: React.FC = () => {
  const [board, setBoard] = useState<CellValue[][]>(() =>
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))
  );

  const [currentPlayer, setCurrentPlayer] = useState<'obsidian' | 'silver'>('obsidian');
  const [winner, setWinner] = useState<CellValue>(null);
  const [winningLine, setWinningLine] = useState<[number, number][]>([]);

  // Check 5 in a row
  const checkWin = (grid: CellValue[][], r: number, c: number, player: 'obsidian' | 'silver') => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal
      [1, -1] // anti-diagonal
    ];

    for (const [dr, dc] of directions) {
      const line: [number, number][] = [[r, c]];

      // Count forward
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && grid[nr][nc] === player) {
          line.push([nr, nc]);
          step++;
        } else break;
      }

      // Count backward
      step = 1;
      while (true) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && grid[nr][nc] === player) {
          line.push([nr, nc]);
          step++;
        } else break;
      }

      if (line.length >= 4) {
        // 4 in a row for fast-paced 8x8 board!
        return line;
      }
    }
    return null;
  };

  const handleCellClick = (r: number, c: number) => {
    if (board[r][c] || winner) return;

    // Instant local state update - zero latency
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = currentPlayer;
    setBoard(newBoard);

    // Haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }

    const winningCells = checkWin(newBoard, r, c, currentPlayer);
    if (winningCells) {
      setWinner(currentPlayer);
      setWinningLine(winningCells);

      confetti({
        particleCount: 45,
        spread: 75,
        origin: { y: 0.6 },
        colors: currentPlayer === 'obsidian' ? ['#8C1D35', '#D4AF37', '#FFF2CE'] : ['#E2E8F0', '#D4AF37', '#64748B']
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 60, 100]);
        } catch {}
      }
    } else {
      setCurrentPlayer(currentPlayer === 'obsidian' ? 'silver' : 'obsidian');
    }
  };

  const resetGame = () => {
    setBoard(
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null))
    );
    setWinner(null);
    setWinningLine([]);
    setCurrentPlayer('obsidian');

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([10]);
      } catch {}
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-5 font-serif select-none">
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-4 sm:p-5 text-[#2C241E] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9C89E]/60 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/40 text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <Crown className="w-4 h-4 text-[#FFE599]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                  WIZARD CHESS · 如尼连珠
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#8C1D35] font-cinzel border border-[#D4AF37]/30">
                  4 IN A ROW
                </span>
              </div>
              <h2 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                黑曜石与秘银 · 执子定胜负
              </h2>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="p-1.5 rounded-xl bg-[#FAF5EB] text-[#8C7658] hover:text-[#8C1D35] hover:bg-[#EADBC4] border border-[#D9C89E]/70 transition-colors cursor-pointer"
            title="复位棋盘"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Player Turn Indicator */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-[#FAF5EB] border border-[#D9C89E]/60 mb-3 text-xs font-cinzel">
          <div className={`flex items-center gap-1.5 ${currentPlayer === 'obsidian' ? 'font-bold text-[#8C1D35]' : 'opacity-40'}`}>
            <span className="w-3.5 h-3.5 rounded-full bg-[#182638] border border-[#D4AF37] shadow-xs inline-block" />
            <span>HE (黑曜石)</span>
          </div>

          <span className="text-[10px] text-[#C5A059] font-bold">
            {winner ? '✦ 对弈结案 ✦' : '轮流执子 · 即点即应'}
          </span>

          <div className={`flex items-center gap-1.5 ${currentPlayer === 'silver' ? 'font-bold text-[#8C1D35]' : 'opacity-40'}`}>
            <span>HER (秘银石)</span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#E2E8F0] border border-[#94A3B8] shadow-xs inline-block" />
          </div>
        </div>

        {/* 8x8 Wooden Rune Chessboard */}
        <div className="p-2 rounded-2xl bg-[#EFE7D5] border-2 border-[#D4AF37]/50 shadow-inner">
          <div className="grid grid-cols-8 gap-1 bg-[#D9C89E]/40 p-1 rounded-xl">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isWinningCell = winningLine.some(([wr, wc]) => wr === r && wc === c);

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={Boolean(cell || winner)}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all relative ${
                      (r + c) % 2 === 0 ? 'bg-[#FCF9F2]' : 'bg-[#F4EBD9]'
                    } hover:bg-[#FFE599]/30 active:scale-95 cursor-pointer`}
                  >
                    {cell === 'obsidian' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className={`w-4/5 h-4/5 rounded-full bg-gradient-to-tr from-[#080E18] to-[#1E293B] border border-[#D4AF37] shadow-md flex items-center justify-center ${
                          isWinningCell ? 'ring-2 ring-[#FFE599] ring-offset-1 animate-pulse' : ''
                        }`}
                      >
                        <span className="text-[8px] text-[#FFE599] opacity-80">ᚱ</span>
                      </motion.div>
                    )}

                    {cell === 'silver' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className={`w-4/5 h-4/5 rounded-full bg-gradient-to-tr from-[#CBD5E1] via-[#F8FAFC] to-[#94A3B8] border border-[#64748B] shadow-md flex items-center justify-center ${
                          isWinningCell ? 'ring-2 ring-[#8C1D35] ring-offset-1 animate-pulse' : ''
                        }`}
                      >
                        <span className="text-[8px] text-[#1E293B] opacity-80">ᚠ</span>
                      </motion.div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Win Banner */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-[#FAF5EB] to-[#FFFDF9] border border-[#D4AF37] text-center font-serif shadow-xs"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel font-bold text-[#8C1D35]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                {winner === 'obsidian' ? '黑曜石（HE）连成四珠大获全胜！' : '秘银石（HER）灵犀连珠拔得头筹！'}
              </span>
            </div>
            <p className="text-[10px] text-[#8C7658] mt-0.5 italic">
              输的一方今晚请喝一杯香浓热可可 ☕
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
