//
// Report section, shows below the game section, when generating report.
//

import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";
import ReportBoard from "@/components/report/ReportBoard";
import ComputerAnalysis from "@/components/report/ComputerAnalysis";
import TimeDiagram from "@/components/report/TimeDiagram";
import MoveList from "@/components/report/MoveList";
import VictorySummary from "@/components/report/VictorySummary";
import StatsSummary from "@/components/report/StatsSummary";
import ReportActions from "@/components/report/ReportActions";
import { useRouter } from "next/navigation";

interface ReportSectionProps {
    setupData: SetupData;
    history: MoveHistoryItem[];
};

export default function ReportSection({ setupData, history }: ReportSectionProps) {
    const router = useRouter();

    const handleNewGame = () => {
        router.push("/setup");
    };

    const handleReplay = () => {
        if (typeof window !== "undefined") {
            window.location.reload();
        }
    };

    return (
        <section aria-label="Report Page" className="w-full bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto py-8">
                {/* Large screen layout scaffold: 3 columns */}
                <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
                    {/* Left column: Board (top) + Computer Analysis (bottom) */}
                    <div className="flex flex-col gap-6">
                        <ReportBoard setupData={setupData} history={history} />
                        <ComputerAnalysis />
                    </div>

                    {/* Middle column: Time diagram (top), Move list (middle), New/Replay (bottom) */}
                    <div className="flex flex-col gap-6">
                        <TimeDiagram setupData={setupData} history={history} />
                        <MoveList setupData={setupData} history={history} />
                        <div className="w-full flex items-center justify-center">
                            <div className="w-[20rem] max-w-full flex items-center justify-center gap-3">
                                <button
                                    onClick={handleNewGame}
                                    className="w-1/2 rounded-lg bg-gray-200 text-gray-800 px-4 py-2 hover:bg-gray-300 transition-colors"
                                >
                                    New Game
                                </button>
                                <button
                                    onClick={handleReplay}
                                    className="w-1/2 rounded-lg bg-gray-200 text-gray-800 px-4 py-2 hover:bg-gray-300 transition-colors"
                                >
                                    Replay
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right column: LLM summary (top), stats (middle), actions (bottom) */}
                    <div className="flex flex-col gap-6">
                        <VictorySummary />
                        <StatsSummary />
                        <ReportActions setupData={setupData} history={history} />
                    </div>
                </div>

                {/* TODO: Mobile layout to be designed later */}
                <div className="lg:hidden">
                    <div className="text-center text-gray-600 py-12">Mobile report layout coming soon.</div>
                </div>
            </div>
        </section>
    );
};

