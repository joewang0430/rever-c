//
// Button to generate .log after the game.
//

import { MoveHistoryItem } from "@/data/types/game";
import { SetupData } from "@/data/types/setup";
import { getPlayerName, getRowName, getColName, getSetupTurnName, boardToLogText } from '../../utils/nameConverters';
import { generateBoardFromHistory } from "@/utils/gameLogistics";

interface ReportGeneratorProps {
    setupData: SetupData;
    history: MoveHistoryItem[];
};

const ReportGenerator = ({ setupData, history }: ReportGeneratorProps) => {
    const handleGenerateLog = () => {
        // Openings
        const blackName = getPlayerName(setupData.black);
        const whiteName = getPlayerName(setupData.white);
        const openings = 
            `${blackName} ● : ○ ${whiteName}\n\n` +
            `Game ID: ${setupData.matchId}\n` + 
            `Board: ${setupData.boardSize}x${setupData.boardSize}\n\n\n` +
            `-- Game Start --\n\n`;
        // Endings
        const lastStep = history[history.length - 1];
        const blackScore = lastStep.pieceCount.B;
        const whiteScore = lastStep.pieceCount.W;
        let winner = "Draw";
        if (blackScore > whiteScore) {
            winner = blackName;
        } else if (whiteScore > blackScore) {
            winner = whiteName;
        }
        const endings = 
            `\n\n-- Game Over --\n` +
            `${blackName} ● ${blackScore} : ${whiteScore} ○ ${whiteName}\n` +
            `Winner: ${winner}\n\n\n` +
            `Provided by reverc.org`
        
        const logContent = openings + history
            .map(item =>    
                `Step ${item.step}:\n` +
                `${item.color === 'B' ? blackName : whiteName} placed ${getSetupTurnName(item.color)} at (${getColName(item.position.col)}${getRowName(item.position.row)}).\n` +
                // `PieceCount: B=${item.pieceCount.B}, W=${item.pieceCount.W}\n`
                `${boardToLogText(generateBoardFromHistory(history, item.step, setupData.boardSize))}\n`
            )
            .join('\n') + endings;

        const blob = new Blob([logContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `rvc_${setupData.matchId}.log`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }

    return(
        <div>
            <button onClick={handleGenerateLog}>Generate Log</button>
        </div>
    )
};

export default ReportGenerator;