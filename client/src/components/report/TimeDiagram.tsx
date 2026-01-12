import { SetupData } from "@/data/types/setup";
import { MoveHistoryItem } from "@/data/types/game";
import { useMemo, useRef, useState } from "react";
import { generateBoardFromHistory, getPieceCount, getMobility } from "@/utils/gameLogistics";

interface TimeDiagramProps {
  setupData: SetupData;
  history: MoveHistoryItem[];
  selectedStep: number;
  setSelectedStep: (n: number) => void;
}

export default function TimeDiagram({ setupData, history, selectedStep, setSelectedStep }: TimeDiagramProps) {
  const steps = history.length;
  const containerRef = useRef<HTMLDivElement>(null);

  // Dataset toggles
  const [showPieces, setShowPieces] = useState(true);
  const [showMobility, setShowMobility] = useState(true);

  // Precompute metrics for all steps
  const size = setupData.boardSize;
  const metrics = useMemo(() => {
    return Array.from({ length: steps + 1 }, (_, i) => {
      const board = generateBoardFromHistory(history, i, size);
      const pB = getPieceCount(board, "B", size);
      const pW = getPieceCount(board, "W", size);
      const { mobility: mB } = getMobility(board, "B", size);
      const { mobility: mW } = getMobility(board, "W", size);
      return { pieces: { B: pB, W: pW }, mobility: { B: mB, W: mW } };
    });
  }, [history, size, steps]);

  // Hover state
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const getStepFromX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.max(0, Math.min(x / rect.width, 1));
    return Math.round(ratio * steps);
  };

  const handleClick = (e: React.MouseEvent) => {
    setSelectedStep(getStepFromX(e.clientX));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
    setHoverStep(getStepFromX(e.clientX));
  };

  const handleMouseLeave = () => {
    setHoverStep(null);
    setHoverX(null);
  };

  // Build polyline points - single line using delta (B-W)/(B+W)
  // y=0 means Black dominates, y=100 means White dominates, y=50 is equal
  // replaceZeroWith: for mobility, replace 0 with 0.5 to avoid extreme visual spikes (e.g., 1:0 looks same as 16:0)
  const buildPoints = (
    getData: (m: typeof metrics[0]) => { B: number; W: number },
    replaceZeroWith?: number
  ) => {
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const m = metrics[i];
      if (!m) continue;
      const d = getData(m);
      let B = d.B;
      let W = d.W;
      // Replace zeros if specified (for mobility to avoid extreme visual spikes)
      if (replaceZeroWith !== undefined) {
        if (B === 0) B = replaceZeroWith;
        if (W === 0) W = replaceZeroWith;
      }
      const total = B + W;
      // delta: 1 when B=total, -1 when W=total, 0 when equal
      const delta = total > 0 ? (B - W) / total : 0;
      // Map delta to y: delta=1 -> y=5, delta=-1 -> y=95, delta=0 -> y=50
      const y = 50 - delta * 45;
      const x = steps > 0 ? (i / steps) * 100 : 50;
      pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return pts.join(" ");
  };

  const piecesPoints = showPieces ? buildPoints((m) => m.pieces) : "";
  const mobilityPoints = showMobility ? buildPoints((m) => m.mobility, 0.5) : "";

  // Read line X position (percent)
  const readLineX = steps > 0 ? (selectedStep / steps) * 100 : 0;
  // Hover line X position (percent)
  const hoverLineX = hoverX != null && containerRef.current
    ? (hoverX / containerRef.current.clientWidth) * 100
    : null;

  return (
    <div className="w-full bg-purple-100 border-2 border-purple-300 rounded p-3">
      <div
        ref={containerRef}
        className="relative h-32 lg:h-40 bg-purple-200 rounded cursor-pointer overflow-hidden"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Center axis - dark gray, clearly visible */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#555" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />

          {/* Pieces line (green) */}
          {showPieces && piecesPoints && (
            <polyline
              points={piecesPoints}
              fill="none"
              stroke="var(--rvc-primary-green)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Mobility line (yellow, dashed) */}
          {showMobility && mobilityPoints && (
            <polyline
              points={mobilityPoints}
              fill="none"
              stroke="var(--rvc-primary-yellow)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="6 4"
            />
          )}

          {/* Read line (selected step) */}
          <line
            x1={readLineX}
            y1="0"
            x2={readLineX}
            y2="100"
            stroke="#6d28d9"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Hover line */}
          {hoverLineX != null && (
            <line
              x1={hoverLineX}
              y1="0"
              x2={hoverLineX}
              y2="100"
              stroke="#6d28d9"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* Tooltip */}
        {hoverStep != null && hoverX != null && (
          <div
            className="absolute px-2 py-1 rounded bg-white text-xs shadow border pointer-events-none"
            style={{
              left: Math.min(Math.max(hoverX + 10, 10), (containerRef.current?.clientWidth || 200) - 100),
              top: 8,
            }}
          >
            <div className="font-medium text-gray-600 mb-1">Step {hoverStep}</div>
            {showPieces && metrics[hoverStep] && (
              <div style={{ color: "var(--rvc-primary-green)" }}>
                Pcs: {metrics[hoverStep].pieces.B} / {metrics[hoverStep].pieces.W}
              </div>
            )}
            {showMobility && metrics[hoverStep] && (
              <div style={{ color: "var(--rvc-primary-yellow)" }}>
                Mob: {metrics[hoverStep].mobility.B} / {metrics[hoverStep].mobility.W}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checkboxes */}
      <div className="mt-3 flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--rvc-primary-green)" }}>
          <input
            type="checkbox"
            checked={showPieces}
            onChange={(e) => setShowPieces(e.target.checked)}
            className="w-4 h-4"
            style={{ accentColor: "var(--rvc-primary-green)" }}
          />
          <span>Pieces</span>
        </label>
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--rvc-primary-yellow)" }}>
          <input
            type="checkbox"
            checked={showMobility}
            onChange={(e) => setShowMobility(e.target.checked)}
            className="w-4 h-4"
            style={{ accentColor: "var(--rvc-primary-yellow)" }}
          />
          <span>Mobility</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input type="checkbox" disabled className="w-4 h-4" />
          <span>Win Rate</span>
        </label>
      </div>
    </div>
  );
}
