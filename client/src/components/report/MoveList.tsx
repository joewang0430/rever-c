import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";

interface MoveListProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
}

export default function MoveList({ setupData, history }: MoveListProps) {
  return (
    <div className="w-full h-64 bg-orange-100 border-2 border-orange-300 rounded flex items-center justify-center">
      <div className="text-orange-900 font-medium">Move List (placeholder)</div>
    </div>
  );
}
