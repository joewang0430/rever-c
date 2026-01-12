import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";

interface ReportBoardProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
  step?: number; // selected replay step (optional for now)
}

export default function ReportBoard({ setupData, history, step }: ReportBoardProps) {
  return (
    <div className="w-full h-64 md:h-80 lg:h-[20rem] bg-blue-100 border-2 border-blue-300 rounded flex items-center justify-center">
      <div className="text-blue-800 font-medium">Board (Replay placeholder)</div>
    </div>
  );
}
