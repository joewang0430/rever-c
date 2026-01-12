import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";
import { useMemo, useRef } from "react";

interface TimeDiagramProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
  selectedStep: number;
  setSelectedStep: (n: number) => void;
}

export default function TimeDiagram({ setupData, history, selectedStep, setSelectedStep }: TimeDiagramProps) {
  const steps = history.length;
  const percent = useMemo(() => {
    if (steps === 0) return 0;
    const clamped = Math.max(0, Math.min(selectedStep, steps));
    return (clamped / steps) * 100;
  }, [selectedStep, steps]);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(x / rect.width, 1));
    const nextStep = Math.round(ratio * steps);
    setSelectedStep(nextStep);
  };

  return (
    <div className="w-full bg-purple-100 border-2 border-purple-300 rounded p-3">
      <div
        ref={containerRef}
        className="relative h-24 lg:h-32 bg-purple-200 rounded text-purple-900 cursor-pointer"
        onClick={handleClick}
        aria-label="Time Diagram"
        role="img"
      >
        {/* Read line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-purple-600"
          style={{ left: `calc(${percent}% - 1px)` }}
        />
        {/* Placeholder center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          Time Diagram (click to select step)
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked />
          <span>Pieces</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked />
          <span>Mobility</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" disabled />
          <span>Win Rate</span>
        </label>
      </div>
    </div>
  );
}
