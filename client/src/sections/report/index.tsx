//
// Report section, shows below the game section, when generating report.
//

import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";
import LogGenerator from "@/components/report/LogGenerator";

interface ReportSectionProps {
    setupData: SetupData;
    history: MoveHistoryItem[];
};

export default function ReportSection({ setupData, history }: ReportSectionProps) {
    return (
        <div className="bg-green-200">
            report
            <LogGenerator 
                setupData={setupData}
                history={history} 
            />
        </div>
    )
};

