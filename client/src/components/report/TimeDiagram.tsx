import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";

interface TimeDiagramProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
}

export default function TimeDiagram({ setupData, history }: TimeDiagramProps) {
  return (
    <div className="w-full bg-purple-100 border-2 border-purple-300 rounded p-3">
      <div className="h-24 lg:h-32 bg-purple-200 rounded flex items-center justify-center text-purple-900">
        Time Diagram (placeholder)
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
