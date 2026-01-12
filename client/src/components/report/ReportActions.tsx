import Link from "next/link";
import LogGenerator from "./LogGenerator";
import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";

interface ReportActionsProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
}

export default function ReportActions({ setupData, history }: ReportActionsProps) {
  return (
    <div className="w-full flex items-center gap-3">
      <Link 
        href="/" 
        className="flex-1 text-center px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
      >
        Home Page
      </Link>
      <div className="flex-1">
        <LogGenerator setupData={setupData} history={history} />
      </div>
      <button className="flex-1 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
        Screen shot
      </button>
    </div>
  );
}
