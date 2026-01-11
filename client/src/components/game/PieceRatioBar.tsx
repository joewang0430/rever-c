// Appears below score and above the board; desktop/tablet only.

"use client";

import { useEffect, useRef, useState } from "react";

interface PieceRatioBarProps {
  blackCount: number;
  whiteCount: number;
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const PieceRatioBar = ({ blackCount, whiteCount }: PieceRatioBarProps) => {
  const total = Math.max(blackCount + whiteCount, 0);
  const targetBlackPct = total > 0 ? (blackCount / total) * 100 : 50;

  // Smooth width animation from previous to next values
  const [blackPct, setBlackPct] = useState<number>(targetBlackPct);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setBlackPct(targetBlackPct);
      return;
    }
    // Update to target; width transition handles smooth animation
    setBlackPct(targetBlackPct);
  }, [targetBlackPct]);

  return (
    <div className="hidden md:block w-full" aria-label="Piece ratio bar">
      <div
        className="relative mx-auto bg-rvc-primary-green rounded-lg"
        style={{
          width: 300,
          padding: "10px 24px",
        }}
      >
        {/* Top protruding label */}
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md border-2 border-gray-50 bg-rvc-primary-green text-white text-xs tracking-wide"
        >
          PCS
        </div>

        {/* Inner track: white background with border, black fill grows/shrinks */}
        <div
          className="w-full"
          style={{ height: 14, backgroundColor: "var(--rvc-primary-white)" }}
        >
          <div
            className="h-full"
            style={{
              width: `${clamp(blackPct)}%`,
              backgroundColor: "var(--rvc-primary-black)",
              transition: "width 450ms ease-in-out",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PieceRatioBar;

