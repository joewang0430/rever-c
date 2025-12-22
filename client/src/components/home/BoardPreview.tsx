"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Board } from "@/data/types/game";
import { generateRandomBoardState } from "@/utils/gameLogistics";

type Props = {
  size?: number; // default 8
};

// Animation timings
// Original diagonal duration was ~3500ms; make it ～x faster
const TRANSITION_MS = 3500 / 3;
// Add a pause between modes and make it ~1.5x longer than before
const PAUSE_MS = Math.floor(3000); // 

export default function BoardPreview({ size = 8 }: Props) {
  const [board, setBoard] = useState<Board>(() => generateRandomBoardState(size));
  const [directionToLetters, setDirectionToLetters] = useState(true);
  const maxOrder = (size - 1) * 2;
  const [stage, setStage] = useState(0); // diagonal threshold
  const reduceMotionRef = useRef<boolean>(false);

  // On mount, re-randomize; respect reduced motion
  useEffect(() => {
    setBoard(generateRandomBoardState(size));
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
  }, [size]);

  // Cycle animation: left-top to right-bottom diagonal reveal
  useEffect(() => {
    if (reduceMotionRef.current) {
      // No animation: show letters state as a static overlay
      setStage(maxOrder);
      return;
    }

    const steps = maxOrder + 1; // include both ends
    const stepMs = Math.max(40, Math.floor(TRANSITION_MS / steps));
    let s = 0;
    setStage(0);

    const id = setInterval(() => {
      s += 1;
      setStage(prev => (prev < maxOrder ? prev + 1 : maxOrder));
      if (s > maxOrder) {
        clearInterval(id);
        // Pause before flipping direction
        const tid = setTimeout(() => {
          setDirectionToLetters(d => !d);
        }, PAUSE_MS);
        return () => clearTimeout(tid);
      }
    }, stepMs);

    return () => clearInterval(id);
  }, [directionToLetters, maxOrder]);

  const cells = useMemo(() => {
    const arr: { r: number; c: number; order: number; val: string }[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        arr.push({ r, c, order: r + c, val: board[r][c] });
      }
    }
    return arr;
  }, [board, size]);

  return (
    <div
      className="relative"
      aria-label="Board preview"
    >
      <div className="rvc-board shadow-sm" style={{
        // keep square and responsive bounds (shrink to ~2/3)
        width: "min(48vw, 280px)",
        height: "min(48vw, 280px)",
      }}>
        <div className="grid" style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
          width: "100%",
          height: "100%",
        }}>
          {cells.map(({ r, c, order, val }) => {
            const revealLetters = directionToLetters ? stage >= order : stage < order;
            const revealPieces = !revealLetters;
            return (
              <div key={`${r}-${c}`} className="rvc-cell relative">
                {/* Piece view */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 ease-in-out"
                  style={{ opacity: revealPieces ? 1 : 0 }}
                >
                  {val !== 'U' ? (
                    <div
                      className={val === 'B' ? "rvc-piece-b" : "rvc-piece-w"}
                    />
                  ) : null}
                </div>

                {/* Letters view */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 ease-in-out"
                  style={{ opacity: revealLetters ? 1 : 0, backgroundColor: "var(--rvc-primary-white)" }}
                >
                  <span className="rvc-letter">
                    {val}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
