import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";
import GameBoard from "@/components/game/GameBoard";
import { generateBoardFromHistory, getUpdatedBoard } from "@/utils/gameLogistics";

interface ReportBoardProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
  step?: number; // selected replay step (optional for now)
}

export default function ReportBoard({ setupData, history, step = 0 }: ReportBoardProps) {
  const size = setupData.boardSize;
  const safeStep = Math.max(0, Math.min(step, history.length));
  const board = generateBoardFromHistory(history, safeStep, size);

  // Compute last move and flipped positions for the selected step
  let lastMove = null as { row: number; col: number } | null;
  let flipped: { row: number; col: number }[] = [];
  if (safeStep > 0) {
    const prevBoard = generateBoardFromHistory(history, safeStep - 1, size);
    const item = history[safeStep - 1];
    lastMove = item.position;
    const { flippedPositions } = getUpdatedBoard(prevBoard, item.color, item.position, size);
    flipped = flippedPositions;
  }

  return (
    <div className="w-full flex items-center justify-center">
      <GameBoard
        board={board}
        size={size}
        turn={null}
        lastMove={lastMove}
        flipped={flipped}
        legalMoves={[]}
        setupData={setupData}
        isEcho={false}
        onCellClick={() => {}}
        showLegalHints={false}
        variant="report"
      />
    </div>
  );
}
