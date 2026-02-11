import Link from "next/link";
import LogGenerator from "./LogGenerator";
import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";
import { Camera, Home } from "lucide-react";
import { toPng } from "html-to-image";

interface ReportActionsProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
}

export default function ReportActions({ setupData, history }: ReportActionsProps) {
  const handleScreenshot = async () => {
    // Find the report section element
    const reportSection = document.querySelector('section[aria-label="Report Page"]');
    if (!reportSection) {
      console.error("Report section not found");
      alert("Unable to capture screenshot");
      return;
    }

    try {
      const dataUrl = await toPng(reportSection as HTMLElement, {
        backgroundColor: "#f9fafb", // bg-gray-50
        pixelRatio: 2, // Higher resolution
      });

      // Download the image
      const link = document.createElement("a");
      link.download = `reversi-game-${setupData.matchId.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Screenshot failed:", error);
      alert("Screenshot failed. Please try again.");
    }
  };

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
      <button 
        onClick={handleScreenshot}
        className="w-12 shrink-0 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors flex items-center justify-center"
      >
        <Camera size={20} />
      </button>
    </div>
  );
}
