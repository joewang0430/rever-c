import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";
import { getSetupTurnName, getRowName, getColName } from "@/utils/nameConverters";

interface MoveListProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
  selectedStep: number;
  setSelectedStep: (n: number) => void;
}

export default function MoveList({ setupData, history, selectedStep, setSelectedStep }: MoveListProps) {
  return (
    <div className="w-full h-64 bg-orange-100 border-2 border-orange-300 rounded p-3 overflow-auto">
      <div className="text-orange-900 font-medium mb-2">Move List</div>
      <ul className="space-y-1">
        {/* Optional: initial board state */}
        <li>
          <button
            className={`w-full text-left px-2 py-1 rounded ${selectedStep === 0 ? "bg-orange-200" : "hover:bg-orange-200"}`}
            onClick={() => setSelectedStep(0)}
          >
            Step 0: Initial Position
          </button>
        </li>
        {history.map((item) => (
          <li key={item.step}>
            <button
              className={`w-full text-left px-2 py-1 rounded ${selectedStep === item.step ? "bg-orange-200" : "hover:bg-orange-200"}`}
              onClick={() => setSelectedStep(item.step)}
            >
              Step {item.step}: {getSetupTurnName(item.color)} at ({getColName(item.position.col)}{getRowName(item.position.row)})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
