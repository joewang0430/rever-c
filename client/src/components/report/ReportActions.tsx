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
    <div className="w-full bg-gray-100 border-2 border-gray-300 rounded p-3 flex items-center justify-between gap-3">
      <Link href="/" className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">Home Page</Link>
      <div>
        <LogGenerator setupData={setupData} history={history} />
      </div>
      <button className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">Screen Shot</button>
    </div>
  );
}
