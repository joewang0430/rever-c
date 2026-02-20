//
// VictorySummary: Dynamic victory message based on score difference.
//

import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";
import { getPlayerName } from "@/utils/nameConverters";
import { useMemo } from "react";

interface VictorySummaryProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
}

// Message structure with title and subtitle generator
interface VictoryMessage {
  title: string;
  getSubtitle: (winnerName: string, winnerSide: string, loserName: string, loserSide: string) => string;
}

// ===== 平局 =====
const drawMessages: VictoryMessage[] = [
  { title: "An evenly matched battle.", getSubtitle: () => "Neither side could claim dominance." },
  { title: "A perfect stalemate.", getSubtitle: () => "Both players fought to a standstill." },
  { title: "Equally matched minds.", getSubtitle: () => "The game ends in a draw." },
  { title: "A battle of equals.", getSubtitle: () => "No victor emerges from this clash." },
  { title: "Balanced to perfection.", getSubtitle: () => "Both sides share the spoils." },
];

// ===== 极限险胜 =====
const closeMessages: VictoryMessage[] = [
  { title: "A nail-biting finish!", getSubtitle: (name, side) => `${name} (${side}) wins by the slimmest of margins.` },
  { title: "Victory by a thread.", getSubtitle: (name, side) => `${name} (${side}) barely edges out the opponent.` },
  { title: "Down to the wire.", getSubtitle: (name, side) => `${name} (${side}) clinches a heart-stopping victory.` },
  { title: "A photo finish.", getSubtitle: (name, side) => `${name} (${side}) takes the win in a thriller.` },
  { title: "Decided by inches.", getSubtitle: (name, side) => `${name} (${side}) survives a razor-thin contest.` },
];

// ===== 力克对手  =====
const solidMessages: VictoryMessage[] = [
  { title: "A well-earned triumph.", getSubtitle: (name, side) => `${name} (${side}) outplays the opponent.` },
  { title: "Skill prevails.", getSubtitle: (name, side) => `${name} (${side}) demonstrates clear superiority.` },
  { title: "A decisive edge.", getSubtitle: (name, side) => `${name} (${side}) takes control when it matters.` },
  { title: "Superior strategy wins.", getSubtitle: (name, side) => `${name} (${side}) reads the board better.` },
  { title: "The better player wins.", getSubtitle: (name, side) => `${name} (${side}) claims a solid victory.` },
];

// ===== 精彩胜利 =====
const greatMessages: VictoryMessage[] = [
  { title: "A resounding victory!", getSubtitle: (name, side) => `${name} (${side}) dominates the board.` },
  { title: "A brilliant performance.", getSubtitle: (name, side) => `${name} (${side}) puts on a masterclass.` },
  { title: "Commanding the game.", getSubtitle: (name, side) => `${name} (${side}) controls from start to finish.` },
  { title: "A spectacular triumph.", getSubtitle: (name, side) => `${name} (${side}) leaves no doubt.` },
  { title: "Excellence on display.", getSubtitle: (name, side) => `${name} (${side}) delivers an impressive win.` },
];

// ===== 碾压局 =====
const crushingMessages: VictoryMessage[] = [
  { title: "Total domination.", getSubtitle: (name, side) => `${name} (${side}) crushes the opposition.` },
  { title: "A complete annihilation.", getSubtitle: (name, side) => `${name} (${side}) leaves nothing to chance.` },
  { title: "An overwhelming conquest.", getSubtitle: (name, side) => `${name} (${side}) shows no mercy.` },
  { title: "Absolute supremacy.", getSubtitle: (name, side) => `${name} (${side}) reigns supreme.` },
  { title: "A merciless rout.", getSubtitle: (name, side) => `${name} (${side}) obliterates the competition.` },
];

function getMessageCategory(scoreDiff: number, boardSize: number): VictoryMessage[] {
  // Base thresholds for 8x8 (64 cells)
  // Scale factor based on board size
  const scale = (boardSize * boardSize) / 64;
  
  // Thresholds adjusted by scale (except the minimum close threshold stays at 2)
  const closeThreshold = Math.max(2, Math.round(6 * scale));
  const solidThreshold = Math.round(16 * scale);
  const greatThreshold = Math.round(34 * scale);

  if (scoreDiff === 0) return drawMessages;
  if (scoreDiff <= closeThreshold) return closeMessages;
  if (scoreDiff <= solidThreshold) return solidMessages;
  if (scoreDiff <= greatThreshold) return greatMessages;
  return crushingMessages;
}

export default function VictorySummary({ setupData, history }: VictorySummaryProps) {
  // Get final scores
  const finalScore = history.length > 0
    ? history[history.length - 1].pieceCount
    : { B: 2, W: 2 };

  const scoreDiff = Math.abs(finalScore.B - finalScore.W);
  const isDraw = scoreDiff === 0;

  // Determine winner and loser
  const winnerSide = finalScore.B > finalScore.W ? "Black" : "White";
  const loserSide = finalScore.B > finalScore.W ? "White" : "Black";
  const winnerConfig = finalScore.B > finalScore.W ? setupData.black : setupData.white;
  const loserConfig = finalScore.B > finalScore.W ? setupData.white : setupData.black;
  const winnerName = getPlayerName(winnerConfig);
  const loserName = getPlayerName(loserConfig);

  // Pick a random message from the appropriate category
  // useMemo ensures we don't re-randomize on every re-render
  const message = useMemo(() => {
    const messages = getMessageCategory(scoreDiff, setupData.boardSize);
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalScore.B, finalScore.W]);

  // Format game time to Toronto timezone (EST/EDT)
  const formattedTime = useMemo(() => {
    try {
      const date = new Date(setupData.createAt);
      return date.toLocaleString("en-US", {
        timeZone: "America/Toronto",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return setupData.createAt;
    }
  }, [setupData.createAt]);

  return (
    <div className="w-full">
      <h2 className="text-4xl font-semibold text-gray-900 mb-2">
        {message.title}
      </h2>
      <p className="text-gray-600 text-base leading-relaxed">
        {isDraw 
          ? message.getSubtitle("", "", "", "")
          : message.getSubtitle(winnerName, winnerSide, loserName, loserSide)
        }
      </p>
      <p className="text-gray-400 text-sm mt-2 leading-normal">
        ID: {setupData.matchId}<br />
        {formattedTime} EST
      </p>
    </div>
  );
}
