import Link from "next/link";
import LogGenerator from "./LogGenerator";
import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";
import { Camera, Home } from "lucide-react";

interface ReportActionsProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
}

export default function ReportActions({ setupData, history }: ReportActionsProps) {
  return (
    <div className="w-full flex items-center gap-3">
      <Link 
        href="/" 
        className="w-12 shrink-0 text-center px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors flex items-center justify-center"
      >
        <Home size={20} />
      </Link>
      <div className="flex-1">
        <LogGenerator setupData={setupData} history={history} />
      </div>
      <button className="w-12 shrink-0 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors flex items-center justify-center">
        <Camera size={20} />
      </button>
    </div>
  );
}
