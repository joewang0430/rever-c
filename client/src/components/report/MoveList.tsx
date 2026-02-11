import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";
import { getRowName, getColName } from "@/utils/nameConverters";
import { useEffect, useRef } from "react";

interface MoveListProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
  selectedStep: number;
  setSelectedStep: (n: number) => void;
}

export default function MoveList({ setupData, history, selectedStep, setSelectedStep }: MoveListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const target = el.querySelector<HTMLButtonElement>(`button[data-step="${selectedStep}"]`);
    if (target) {
      target.scrollIntoView({ block: "nearest" });
    }
  }, [selectedStep]);

  // Helper for row classes - selected rows don't have hover effect
  const getRowClasses = (step: number, isSelected: boolean) => {
    if (isSelected) {
      return "bg-gray-200"; // No hover effect for selected
    }
    const baseBg = step % 2 === 1 ? "bg-gray-50" : "bg-white";
    return `${baseBg} hover:bg-gray-200`;
  };

  return (
    <div className="w-full h-80 bg-gray-100 border-2 border-gray-300 rounded-md flex flex-col">
      {/* Fixed header */}
      <div className="text-gray-900 px-6 py-2 rvct-theme text-center shrink-0">
        All Moves
      </div>
      {/* Scrollable list */}
      <div ref={containerRef} className="flex-1 overflow-auto px-6 py-2 font-medium text-gray-600">
        <ul>
          {/* Initial board state */}
          <li>
            <button
              className={`w-full text-left px-2 py-1 ${getRowClasses(0, selectedStep === 0)}`}
              onClick={() => setSelectedStep(0)}
              data-step={0}
            >
              <span className="inline-block w-8 text-right mr-4">0.</span>
              <span>Initial</span>
            </button>
          </li>
          {history.map((item) => (
            <li key={item.step}>
              <button
                className={`w-full text-left px-2 py-1 ${getRowClasses(item.step, selectedStep === item.step)}`}
                onClick={() => setSelectedStep(item.step)}
                data-step={item.step}
              >
                <span className="inline-block w-8 text-right mr-4">{item.step}.</span>
                <span>{item.color} -- [{getColName(item.position.col)}{getRowName(item.position.row)}]</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Fixed bottom spacer - always visible regardless of scroll position */}
      <div className="h-4 shrink-0"></div>
    </div>
  );
}
