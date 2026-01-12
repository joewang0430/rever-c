//
// Button to generate .log after the game.
//

import { MoveHistoryItem } from "@/data/types/game";
import { SetupData } from "@/data/types/setup";
import { getPlayerName, getRowName, getColName, getSetupTurnName, boardToLogText, formatElapsed} from '../../utils/nameConverters';
import { generateBoardFromHistory } from "@/utils/gameLogistics";

interface ReportGeneratorProps {
    setupData: SetupData;
    history: MoveHistoryItem[];
};

const LogGenerator = ({ setupData, history }: ReportGeneratorProps) => {
    const handleGenerateLog = () => {
        // Openings
        const blackName = getPlayerName(setupData.black);
        const whiteName = getPlayerName(setupData.white);
        const openings = 
            `${blackName} ● : ○ ${whiteName}\n\n` +
            `Game ID: ${setupData.matchId}\n` + 
            `Board: ${setupData.boardSize}x${setupData.boardSize}\n` +
            `${setupData.createAt}\n\n\n` +
            `-- Game Start --\n\n`;
        // Endings
        const lastStep = history[history.length - 1];
        const blackScore = lastStep.pieceCount.B;
        const whiteScore = lastStep.pieceCount.W;
        const totalBlackTime = history.reduce((sum, item) => sum + (item.time?.B ?? 0), 0);
        const totalWhiteTime = history.reduce((sum, item) => sum + (item.time?.W ?? 0), 0);
        const maxBlackTime = history.length > 0 ? Math.max(...history.map(item => item.time.B)) : 0;
        const maxWhiteTime = history.length > 0 ? Math.max(...history.map(item => item.time.W)) : 0;
        let winner = "Draw";
        let winnerColor = "";
        if (blackScore > whiteScore) {
            winner = blackName;
            winnerColor = "Black";
        } else if (whiteScore > blackScore) {
            winner = whiteName;
            winnerColor = "White";
        }
        const endings = 
            `\n\n-- Game Over --\n\n` +
            `${blackName} ● ${blackScore} : ${whiteScore} ○ ${whiteName}\n` +
            `Winner: ${winner} (${winnerColor})\n\n`+
            ((setupData.black.type === 'archive' || setupData.black.type === 'custom') ? 
                `${blackName} (Black) used ${formatElapsed(totalBlackTime)}, [max turn: ${formatElapsed(maxBlackTime)}]\n` : ''
            ) +
            ((setupData.white.type === 'archive' || setupData.white.type === 'custom') ? 
                `${whiteName} (White) used ${formatElapsed(totalWhiteTime)}, [max turn: ${formatElapsed(maxWhiteTime)}]\n` : ''
            ) + 
            ((setupData.black.type === 'custom' || setupData.white.type === 'custom') ?
                `* Note: All time data measured by ReverC is for reference only, and may not be fully accurate.` : ''
            ) +
            `\n\nProvided by reverc.org`
        // General
        const logContent = openings + history
            .map(item =>    
                `Step ${item.step}:\n` +
                `${item.color === 'B' ? blackName : whiteName} placed ${getSetupTurnName(item.color)} at (${getColName(item.position.col)}${getRowName(item.position.row)}).\n` +
                (
                    // Only when player type is archive or custom, then display time
                    ((item.color === 'B' && (setupData.black.type === 'archive' || setupData.black.type === 'custom')) ||
                    (item.color === 'W' && (setupData.white.type === 'archive' || setupData.white.type === 'custom')))
                    ? `Approx time: ${item.color === 'B' ? formatElapsed(item.time.B) : formatElapsed(item.time.W)}\n`
                    : ''
                ) +
                // mobility info added here
                `Mobility: ${blackName} ● ${item.mobility.B} : ${item.mobility.W} ○ ${whiteName}\n` +
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
        <button 
            onClick={handleGenerateLog}
            className="w-full px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
        >
            Generate Log
        </button>
    )
};

export default LogGenerator;



// ------------- BELOW ARE LOG TRAINING VERSION ------------- 
// import { MoveHistoryItem } from "@/data/types/game";
// import { SetupData } from "@/data/types/setup";
// import { getPlayerName, getRowName, getColName, getSetupTurnName, boardToLogText, formatElapsed} from '../../utils/nameConverters';
// import { generateBoardFromHistory } from "@/utils/gameLogistics";

// interface ReportGeneratorProps {
//     setupData: SetupData;
//     history: MoveHistoryItem[];
// };

// const LogGenerator = ({ setupData, history }: ReportGeneratorProps) => {
//     const handleGenerateLog = () => {
//         // Openings
//         const blackName = getPlayerName(setupData.black);
//         const whiteName = getPlayerName(setupData.white);
//         const openings = 
//             `${blackName} ● : ○ ${whiteName}\n\n` +
//             `Game ID: ${setupData.matchId}\n` + 
//             `Board: ${setupData.boardSize}x${setupData.boardSize}\n` +
//             `${setupData.createAt}\n\n\n` +
//             `-- Game Start --\n\n`;
//         // Endings
//         const lastStep = history[history.length - 1];
//         const blackScore = lastStep.pieceCount.B;
//         const whiteScore = lastStep.pieceCount.W;
//         const totalBlackTime = history.reduce((sum, item) => sum + (item.time?.B ?? 0), 0);
//         const totalWhiteTime = history.reduce((sum, item) => sum + (item.time?.W ?? 0), 0);
//         const maxBlackTime = history.length > 0 ? Math.max(...history.map(item => item.time.B)) : 0;
//         const maxWhiteTime = history.length > 0 ? Math.max(...history.map(item => item.time.W)) : 0;
//         let winner = "Draw";
//         let winnerColor = "";
//         if (blackScore > whiteScore) {
//             winner = blackName;
//             winnerColor = "Black";
//         } else if (whiteScore > blackScore) {
//             winner = whiteName;
//             winnerColor = "White";
//         }
//         const endings = 
//             `\n\n-- Game Over --\n\n` +
//             `*Winner: ${winnerColor}\n\n`+
//             `${blackName} ● ${blackScore} : ${whiteScore} ○ ${whiteName}\n` +
//             ((setupData.black.type === 'archive' || setupData.black.type === 'custom') ? 
//                 `${blackName} (Black) used ${formatElapsed(totalBlackTime)}, [max turn: ${formatElapsed(maxBlackTime)}]\n` : ''
//             ) +
//             ((setupData.white.type === 'archive' || setupData.white.type === 'custom') ? 
//                 `${whiteName} (White) used ${formatElapsed(totalWhiteTime)}, [max turn: ${formatElapsed(maxWhiteTime)}]\n` : ''
//             ) + 
//             `\n\nProvided by reverc.org`
//         // General
//         const logContent = openings + history
//             .map(item => 
//                 // `Step ${item.step}:\n` +
//                 ((item.step === 1 || item.step > 53) ?
//                 (
//                     `` 
//                 ) : (
//                     `${getSetupTurnName(item.color)}\n` + `${getColName(item.position.col)}${getRowName(item.position.row)}\n\n`
//                 ))
//                 +
//                 // bard here
//                 ((item.step === 60 || item.step > 52) ?
//                 (
//                     ``
//                 ) : (
//                     `${boardToLogText(generateBoardFromHistory(history, item.step, setupData.boardSize))}\n`
//                 )) 
//             )
//             .join('') + endings;

//         const blob = new Blob([logContent], { type: "text/plain" });
//         const url = URL.createObjectURL(blob);

//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `rvc_${setupData.matchId}.log`;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);

//         URL.revokeObjectURL(url);
//     }

//     return(
//         <div>
//             <button onClick={handleGenerateLog}>Generate Log</button>
//         </div>
//     )
// };

// export default LogGenerator;