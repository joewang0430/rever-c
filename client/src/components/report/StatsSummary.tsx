//
// StatsSummary: displays final match statistics for both players.
//

import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem, Board, Turn } from "@/data/types/game";
import { generateBoardFromHistory } from "@/utils/gameLogistics";
import { getPlayerName, getPlayerRating } from "@/utils/nameConverters";

interface StatsSummaryProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
}

// ---------- Utility functions for calculating stats ----------

/** Count corners owned by each player on the final board */
function countCorners(board: Board, size: number): { B: number; W: number } {
  const corners = [
    [0, 0],
    [0, size - 1],
    [size - 1, 0],
    [size - 1, size - 1],
  ];
  let B = 0, W = 0;
  for (const [r, c] of corners) {
    if (board[r][c] === "B") B++;
    else if (board[r][c] === "W") W++;
  }
  return { B, W };
}

/** Count how many times each player was skipped (opponent moved consecutively) */
function countSkipped(history: MoveHistoryItem[]): { B: number; W: number } {
  let B = 0, W = 0;
  for (let i = 1; i < history.length; i++) {
    // If two consecutive moves are by the same player, the other was skipped
    if (history[i].color === history[i - 1].color) {
      if (history[i].color === "B") W++; // White was skipped
      else B++; // Black was skipped
    }
  }
  return { B, W };
}

/** Calculate total time for a given color (in microseconds) */
function calcTotalTime(history: MoveHistoryItem[], color: Turn): number {
  return history
    .filter((h) => h.color === color)
    .reduce((sum, h) => sum + (h.time[color] || 0), 0);
}

/** Calculate max time for a given color */
function calcMaxTime(history: MoveHistoryItem[], color: Turn): number {
  const times = history.filter((h) => h.color === color).map((h) => h.time[color] || 0);
  return times.length > 0 ? Math.max(...times) : 0;
}

/** Calculate average time for a given color */
function calcAvgTime(history: MoveHistoryItem[], color: Turn): number {
  const moves = history.filter((h) => h.color === color);
  if (moves.length === 0) return 0;
  const total = moves.reduce((sum, h) => sum + (h.time[color] || 0), 0);
  return total / moves.length;
}

/** Calculate max flips for a given color */
function calcMaxFlips(history: MoveHistoryItem[], color: Turn): number {
  const flips = history.filter((h) => h.color === color).map((h) => h.flips[color] || 0);
  return flips.length > 0 ? Math.max(...flips) : 0;
}

/** Calculate average mobility for a given color */
function calcAvgMobility(history: MoveHistoryItem[], color: Turn): number {
  const moves = history.filter((h) => h.color === color);
  if (moves.length === 0) return 0;
  const total = moves.reduce((sum, h) => sum + (h.mobility[color] || 0), 0);
  return total / moves.length;
}

/** Format time in microseconds to readable string */
function formatTime(us: number): string {
  if (us === 0) return "0 ms";
  if (us < 1000) return `${Math.round(us)} μs`;
  const ms = us / 1000;
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  const s = ms / 1000;
  return `${s.toFixed(2)} s`;
}

// ---------- Sub-components ----------

/** Player header with piece icon and name */
function PlayerHeader({ name, rating, side }: { name: string; rating: string; side: "black" | "white" }) {
  return (
    <div className="flex flex-col items-center">
      {/* Piece icon with green background */}
      <div className="w-10 h-10 rounded-full bg-rvc-primary-green flex items-center justify-center">
        <div 
          className={`w-7 h-7 rounded-full ${
            side === "black" 
              ? "bg-gray-800" 
              : "bg-white border-2 border-gray-300"
          }`}
        />
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-800 text-center leading-tight">{name}</div>
      <div className="text-xs text-gray-500">{rating}</div>
    </div>
  );
}

/** A single stat row with label in center and values on sides */
function StatRow({
  label,
  blackValue,
  whiteValue,
}: {
  label: string;
  blackValue: string;
  whiteValue: string;
}) {
  return (
    <div className="grid grid-cols-3 items-center text-sm py-1">
      <div className="text-right font-medium text-gray-800 pr-2">{blackValue}</div>
      <div className="text-center text-gray-500 text-xs">{label}</div>
      <div className="text-left font-medium text-gray-800 pl-2">{whiteValue}</div>
    </div>
  );
}

// ---------- Main Component ----------

export default function StatsSummary({ setupData, history }: StatsSummaryProps) {
  const size = setupData.boardSize;
  const finalBoard = generateBoardFromHistory(history, history.length, size);

  // Get final scores from the last history item, or fallback to counting
  const finalScore = history.length > 0
    ? history[history.length - 1].pieceCount
    : { B: 2, W: 2 };

  // Determine if players are "code" type (archive or custom) for time stats
  const blackIsCode = setupData.black.type === "archive" || setupData.black.type === "custom";
  const whiteIsCode = setupData.white.type === "archive" || setupData.white.type === "custom";

  // Calculate all stats
  const corners = countCorners(finalBoard, size);
  const skipped = countSkipped(history);
  const maxFlipsB = calcMaxFlips(history, "B");
  const maxFlipsW = calcMaxFlips(history, "W");
  const avgMobilityB = calcAvgMobility(history, "B");
  const avgMobilityW = calcAvgMobility(history, "W");

  // Time stats (only for code players)
  const totalTimeB = blackIsCode ? calcTotalTime(history, "B") : 0;
  const totalTimeW = whiteIsCode ? calcTotalTime(history, "W") : 0;
  const maxTimeB = blackIsCode ? calcMaxTime(history, "B") : 0;
  const maxTimeW = whiteIsCode ? calcMaxTime(history, "W") : 0;
  const avgTimeB = blackIsCode ? calcAvgTime(history, "B") : 0;
  const avgTimeW = whiteIsCode ? calcAvgTime(history, "W") : 0;

  // Player info
  const blackName = getPlayerName(setupData.black);
  const whiteName = getPlayerName(setupData.white);
  const blackRating = getPlayerRating(setupData.black);
  const whiteRating = getPlayerRating(setupData.white);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      {/* Player Headers */}
      <div className="grid grid-cols-3 items-start mb-2">
        <PlayerHeader name={blackName} rating={blackRating} side="black" />
        <div /> {/* Empty center column for alignment */}
        <PlayerHeader name={whiteName} rating={whiteRating} side="white" />
      </div>

      {/* Stats Rows */}
      <div className="border-t border-gray-100 pt-2 space-y-0">
        <StatRow
          label="Final Score"
          blackValue={String(finalScore.B)}
          whiteValue={String(finalScore.W)}
        />
        <StatRow
          label="Accuracy (under development)"
          blackValue="N/A"
          whiteValue="N/A"
        />
        <StatRow
          label="Total Calculate"
          blackValue={blackIsCode ? formatTime(totalTimeB) : "N/A"}
          whiteValue={whiteIsCode ? formatTime(totalTimeW) : "N/A"}
        />
        <StatRow
          label="Max Calculate"
          blackValue={blackIsCode ? formatTime(maxTimeB) : "N/A"}
          whiteValue={whiteIsCode ? formatTime(maxTimeW) : "N/A"}
        />
        <StatRow
          label="Avg Calculate"
          blackValue={blackIsCode ? formatTime(avgTimeB) : "N/A"}
          whiteValue={whiteIsCode ? formatTime(avgTimeW) : "N/A"}
        />
        <StatRow
          label="Corners"
          blackValue={String(corners.B)}
          whiteValue={String(corners.W)}
        />
        <StatRow
          label="Max Flips"
          blackValue={String(maxFlipsB)}
          whiteValue={String(maxFlipsW)}
        />
        <StatRow
          label="Skipped"
          blackValue={String(skipped.B)}
          whiteValue={String(skipped.W)}
        />
        <StatRow
          label="Avg Mobility"
          blackValue={avgMobilityB.toFixed(1)}
          whiteValue={avgMobilityW.toFixed(1)}
        />
      </div>
    </div>
  );
}
