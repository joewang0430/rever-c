//
// Gaming section.
//

"use client";
import { parseSetupFromHash } from "@/utils/setupTransport";

import { useState, useEffect, useRef } from "react";
import { SetupData } from "@/data/types/setup";
import { useGame } from "@/hooks/useGame";
import PieceCountDisplay from "@/components/game/pieceCountDisplay";
import PieceRatioBar from "@/components/game/PieceRatioBar";
import GameStatusDisplay from "@/components/game/GameStatusDisplay";
import PlayerInfoDisplay from "@/components/game/PlayerInfoDisplay";
// import RoundDisplay from "@/components/game/RoundDisplay";
import GameBoard from "@/components/game/GameBoard";
import { 
    defaultPlayerStats, 
    Move, 
    Turn,
    FetchCodeMoveParams, 
    FetchCodeMoveResult,
    FetchAIMoveResult
} from "@/data/types/game";
import { getSetupTurnName, getPlayerName } from "@/utils/nameConverters";
import { fetchCustomMove, fetchArchiveMove, fetchAIMove } from "@/api/playApi";
import { storage } from "@/utils/storage";
import { raiseGameErrorWindow, isFetchAIMoveResult, clearCandidate } from "@/utils/gameLogistics";
import { useRouter } from 'next/navigation';
import ReportSection from "../report";
import { useSetupDataContext } from "@/contexts/SetupDataContext";  // added
import SetupTitle from "@/components/setup/SetupTitle";

interface GameProps {
    matchId: string;
};

export default function Game({ matchId}: GameProps) {
    const [setupData, setSetupDataLocal] = useState<SetupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const game = useGame(setupData);

    const router = useRouter();

    const [showReport, setShowReport] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const { setSetupData } = useSetupDataContext();  // added

    // UI toggles
    const [showLegalMoves, setShowLegalMoves] = useState(false);
    const [accelerateSpeed, setAccelerateSpeed] = useState(false);

    // Initialize toggles from local storage with defaults:
    // Show Legal Moves -> true (default), Accelerate Speed -> false (default)
    useEffect(() => {
        try {
            const savedLegal = storage.getJSON<boolean>("showLegalMoves");
            setShowLegalMoves(savedLegal === null ? true : !!savedLegal);
            // accelerateSpeed is match-local only; default false per match
            setAccelerateSpeed(false);
        } catch {}
    }, []);

    const handleShowReport = () => {
        setShowReport(true);
        setTimeout(() => {
            reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    const handleNewGame = async () => {
        router.push("/setup");
        if (setupData) {
            try {
                await clearCandidate(setupData);
            } catch (e) {
                // silently ignore cleanup errors here
            }
        }
    };

    const handleReplay = () => {
        if (typeof window !== "undefined") {
            window.location.reload();
        }
    };

    // Prefer reading setup from URL hash token (pure frontend). If missing/invalid, redirect back to setup with an error message.
    useEffect(() => {
        if (!matchId) return;
        setLoading(true);
        try {
            const hash = typeof window !== "undefined" ? window.location.hash : "";
            const dataFromHash = parseSetupFromHash(hash);
            if (dataFromHash && dataFromHash.matchId === matchId) {
                setSetupDataLocal(dataFromHash);
                setSetupData(dataFromHash);
                setLoading(false);
                return;
            }
        } catch (e) {
            // will redirect
        }
        // No backend fallback: show browser alert, then redirect to setup
        if (typeof window !== "undefined") {
            const msg = "Invalid or missing game setup in URL. Please reconfigure your game from the setup page.";
            window.alert(msg);
        }
        router.push("/setup");
    }, [matchId]);

    // Process the move from computer ("custom" | "archive" | "ai")
    const isRequestingComputer = useRef(false);
    useEffect(() => {
        if (!setupData || !game.turn || game.gameOver) return;
        if (isRequestingComputer.current) return;   // Is requesting, return imdtl
        
        const side = getSetupTurnName(game.turn);
        const turn = game.turn;
        
        // Only process computer players
        if (setupData[side].type === 'human') return;

        const fetchComputerMove = async() => {
            // Double-check before starting request
            if (isRequestingComputer.current) return;
            if (game.gameOver) return;
            
            isRequestingComputer.current = true;
            try {
                let computerMove: FetchCodeMoveResult | FetchAIMoveResult | null = null;
                const isCode = (t: string | null | undefined) => t === 'custom' || t === 'archive';
                const bothCodePlayers = !!setupData && isCode(setupData.black.type) && isCode(setupData.white.type);
                const delayMs = bothCodePlayers ? (accelerateSpeed ? 150 : 600) : 1000;
                const delayPromise = new Promise(resolve => setTimeout(resolve, delayMs));

                // Type: custom
                if (setupData[side].type === 'custom') {
                    const customPlayerType = setupData[side].config?.customType;
                    const customPlayerCodeId = setupData[side].config?.customCodeId;

                    if (!customPlayerType || !customPlayerCodeId) {
                        raiseGameErrorWindow(setupData, "Uploaded code config is missing.", () => {router.push("/setup")});
                        isRequestingComputer.current = false;
                        return;
                    }
                    computerMove = await fetchCustomMove({
                        board: game.board,
                        turn: game.turn as Turn,
                        size: setupData.boardSize,
                    }, customPlayerType, customPlayerCodeId);

                // Type: archive
                } else if (setupData[side].type === 'archive'){
                    const archivePlayerGroup = setupData[side].config?.archiveGroup;
                    const archivePlayerId = setupData[side].config?.archiveId;
                    
                    if (!archivePlayerGroup || !archivePlayerId) {
                        raiseGameErrorWindow(setupData, "Archived code config is missing.", () => {router.push("/setup")});
                        isRequestingComputer.current = false;
                        return;
                    }
                    computerMove = await fetchArchiveMove({
                        board: game.board,
                        turn: game.turn as Turn,
                        size: setupData.boardSize,
                    }, archivePlayerGroup, archivePlayerId);

                // Type: ai
                } else if (setupData[side].type === 'ai') {
                    const aiId = setupData[side].config?.aiId;

                    if (!aiId) {
                        raiseGameErrorWindow(setupData, "AI config is missing.", () => {router.push("/setup")});
                        isRequestingComputer.current = false;
                        return;
                    }
                    computerMove = await fetchAIMove ({
                        board: game.board,
                        turn: game.turn as Turn,
                        size: setupData.boardSize,
                        availableMoves: game.availableMoves,
                        lastMove: game.lastMove,
                    }, aiId);
                }
                // TODO: clean up data & exit window if not valid (related to network / basic form)
                // sice handleMove process some other basic error

                await delayPromise; // Ensure at least wait 0.5s

                if (computerMove) { 
                    const elapsed = "elapsed" in computerMove ? computerMove.elapsed : 0;
                    
                    // Check for timeout (only for code players)
                    if ("timeout" in computerMove && computerMove.timeout) {
                        const playerName = getPlayerName(setupData[side]);
                        const colorName = side === 'black' ? 'Black' : 'White';
                        const msg = `The ${colorName} player, ${playerName}, exceeded the time limit (3 seconds), thus the game quit unexpectedly.`;
                        raiseGameErrorWindow(setupData, msg, () => {router.push("/setup")});
                        isRequestingComputer.current = false;
                        return;
                    }
                    
                    // Validate move before applying
                    if (!computerMove.move || typeof computerMove.move.row !== 'number' || typeof computerMove.move.col !== 'number') {
                        throw new Error("Invalid move data from AI");
                    }
                    
                    game.handleMove(computerMove.move, elapsed); 

                    // Code .c
                    if (setupData[side].type !== 'ai' && !isFetchAIMoveResult(computerMove)) {
                        game.setPlayersStats(prev => {
                            const newStats = { ...prev };
                            newStats[turn] = {
                                ...newStats[turn],
                                // Time consumed this turn
                                time: computerMove.elapsed,
                                // Accumulate total thinking time
                                totalTime: (newStats[turn].totalTime || 0) + (computerMove.elapsed || 0),
                                // Update max thinking time
                                maxTime: Math.max(newStats[turn].maxTime || 0, computerMove.elapsed || 0),
                                // Update returnValue
                                returnValue: computerMove.returnValue ?? null,
                            };
                            return newStats;
                        });

                    // AI LLM
                    } else if (setupData[side].type === 'ai' && isFetchAIMoveResult(computerMove)) {
                        game.setPlayersStats(prev => {
                            const newStats = { ...prev };
                            const prevExps = newStats[turn].explanations || [];
                            newStats[turn] = {
                                ...newStats[turn],
                                explanation: computerMove.explanation,
                                explanations: [
                                    ...prevExps,
                                    { move: computerMove.move, text: computerMove.explanation }
                                ],
                            };
                            return newStats;
                        });
                    }
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                raiseGameErrorWindow(setupData, errorMsg, () => {router.push("/setup")});
            } finally {
                isRequestingComputer.current = false;
            }
        }
        fetchComputerMove();
    }, [game.turn, game.gameOver, game.board]);

    if (loading) return <div>Loading game data...</div>;
    if (error) return null; // In pure-frontend flow we redirect on error
    if (!setupData) return null; // while redirecting or before parsing, render nothing

    return (
        <section aria-label="Game Page" className="bg-gray-50">
            
            <div className="max-w-6xl mx-auto min-h-screen">
                <div className="h-15"></div>
                {/* --- Large Screen Layout: 3 fixed columns (Left / Middle / Right) --- */}
                <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">

                    {/* Left Column (Black Player) */}
                    <div className="lg:flex lg:flex-col lg:gap-2">
                        <div className="lg:h-2"></div>
                        <PlayerInfoDisplay 
                            playerConfig={setupData.black}
                            playerStats={game.playersStats.B || defaultPlayerStats}
                        />
                    </div>

                    {/* Middle Column (Game core UI) */}
                    <div className="lg:flex lg:flex-col lg:items-center lg:gap-4">
                        {/* <GameStatusDisplay gameOver={game.gameOver} /> */}
                        {/* <PieceCountDisplay 
                            blackCount={game.playersStats.B.pieceCount}
                            whiteCount={game.playersStats.W.pieceCount}
                        /> */}
                        <SetupTitle 
                            context="game" 
                            score={{ 
                                black: game.playersStats.B.pieceCount, 
                                white: game.playersStats.W.pieceCount 
                            }} 
                            gameOver={game.gameOver}
                        /> 
                        {/* Ratio bar below score, above board (desktop/tablet only) */}
                        <PieceRatioBar 
                            blackCount={game.playersStats.B.pieceCount}
                            whiteCount={game.playersStats.W.pieceCount}
                        />
                        

                        <GameBoard 
                            board={game.board}
                            size={setupData.boardSize}
                            turn={game.turn}
                            lastMove={game.lastMove}
                            flipped={game.flipped}
                            legalMoves={game.availableMoves}
                            setupData={setupData}
                            isEcho={game.isEcho}
                            onCellClick={game.handleMove}
                            showLegalHints={showLegalMoves}
                        />

                        {/* Toggle controls under the board (desktop/tablet shown within this layout) */}
                        {!game.gameOver && (
                        <div className={`hidden md:flex md:flex-col w-full items-center justify-center gap-3 mt-3 ${game.gameOver ? 'hidden' : ''}`}>
                            <div className="flex items-center gap-2 select-none">
                                <input
                                    type="checkbox"
                                    checked={showLegalMoves}
                                    onChange={(e) => {
                                        const v = e.target.checked;
                                        setShowLegalMoves(v);
                                        storage.setJSON("showLegalMoves", v);
                                    }}
                                    className="cursor-pointer w-5 h-5 rounded-md border-2 border-rvc-primary-green"
                                    style={{ accentColor: "var(--rvc-primary-green)" }}
                                    aria-label="Show Legal Moves"
                                />
                                <span className="text-lg">Show Legal Moves</span>
                            </div>
                            {(setupData && (setupData.black.type === 'custom' || setupData.black.type === 'archive') && (setupData.white.type === 'custom' || setupData.white.type === 'archive')) && (
                                <div className="flex items-center gap-2 select-none">
                                    <input
                                        type="checkbox"
                                        checked={accelerateSpeed}
                                        onChange={(e) => {
                                            const v = e.target.checked;
                                            setAccelerateSpeed(v);
                                        }}
                                        className="cursor-pointer w-5 h-5 rounded-md border-2 border-rvc-primary-green"
                                        style={{ accentColor: "var(--rvc-primary-green)" }}
                                        aria-label="Accelerate Speed"
                                    />
                                    <span className="text-lg">Accelerate Speed</span>
                                </div>
                            )}
                        </div>
                        )}

                        {game.gameOver && !showReport && (
                            <div className="w-full flex items-center justify-center mt-4">
                                <div className="w-[18rem] max-w-full">
                                    <button
                                        onClick={handleShowReport}
                                        aria-label="See Game Report"
                                        className="w-full rounded-lg border-2 border-rvc-primary-green text-rvc-primary-green bg-transparent px-4 py-2 hover:bg-rvc-primary-green hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            aria-hidden="true"
                                        >
                                            <path d="M5 20V10" strokeLinecap="round" />
                                            <path d="M12 20V4" strokeLinecap="round" />
                                            <path d="M19 20V14" strokeLinecap="round" />
                                        </svg>
                                        <span>See Game Report</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {game.gameOver && (
                            <div className="w-full flex items-center justify-center mt-2">
                                <div className="w-[18rem] max-w-full flex items-center justify-center gap-3">
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
                        )}
                    </div>

                    {/* Right Column (White Player) */}
                    <div className="lg:flex lg:flex-col lg:gap-2">
                        <div className="lg:h-2"></div>
                        <PlayerInfoDisplay 
                            playerConfig={setupData.white}
                            playerStats={game.playersStats.W || defaultPlayerStats}
                        />
                    </div>
                </div>

                {/* --- Small Screen Layout: stack in order 3 (top) -> 2 (middle) -> 1 (bottom) --- */}
                <div className="flex flex-col gap-6 lg:hidden">
                    {/* Top: Second PlayerInfoDisplay (White) */}
                    <PlayerInfoDisplay 
                        playerConfig={setupData.white}
                        playerStats={game.playersStats.W || defaultPlayerStats}
                    />

                    {/* Middle: Game core UI */}
                    <div className="flex flex-col items-center">
                        <GameStatusDisplay gameOver={game.gameOver} />
                        <PieceCountDisplay 
                            blackCount={game.playersStats.B.pieceCount}
                            whiteCount={game.playersStats.W.pieceCount}
                        />
                        {/* <RoundDisplay placeCount={game.placeCount} /> */}

                        <GameBoard 
                            board={game.board}
                            size={setupData.boardSize}
                            turn={game.turn}
                            lastMove={game.lastMove}
                            flipped={game.flipped}
                            legalMoves={game.availableMoves}
                            setupData={setupData}
                            isEcho={game.isEcho}
                            onCellClick={game.handleMove}
                            showLegalHints={showLegalMoves}
                        />

                        {/* Toggle controls under the board (mobile layout) */}
                        {!game.gameOver && (
                        <div className={`flex md:hidden flex-col w-full items-center justify-center gap-2 mt-3 ${game.gameOver ? 'hidden' : ''}`}>
                            <div className="flex items-center gap-2 select-none">
                                <input
                                    type="checkbox"
                                    checked={showLegalMoves}
                                    onChange={(e) => {
                                        const v = e.target.checked;
                                        setShowLegalMoves(v);
                                        storage.setJSON("showLegalMoves", v);
                                    }}
                                    className="cursor-pointer w-5 h-5 rounded-md border-2 border-rvc-primary-green"
                                    style={{ accentColor: "var(--rvc-primary-green)" }}
                                    aria-label="Show Legal Moves"
                                />
                                <span className="text-base">Show Legal Moves</span>
                            </div>
                            {(setupData && (setupData.black.type === 'custom' || setupData.black.type === 'archive') && (setupData.white.type === 'custom' || setupData.white.type === 'archive')) && (
                                <div className="flex items-center gap-2 select-none">
                                    <input
                                        type="checkbox"
                                        checked={accelerateSpeed}
                                        onChange={(e) => {
                                            const v = e.target.checked;
                                            setAccelerateSpeed(v);
                                        }}
                                        className="cursor-pointer w-5 h-5 rounded-md border-2 border-rvc-primary-green"
                                        style={{ accentColor: "var(--rvc-primary-green)" }}
                                        aria-label="Accelerate Speed"
                                    />
                                    <span className="text-base">Accelerate Speed</span>
                                </div>
                            )}
                        </div>
                        )}

                        {game.gameOver && !showReport && (
                            <div className="w-full flex items-center justify-center mt-8">
                                <div className="w-[20rem] max-w-full">
                                    <button
                                        onClick={handleShowReport}
                                        aria-label="See Game Report"
                                        className="w-full rounded-lg border-2 border-rvc-primary-green text-rvc-primary-green bg-transparent px-4 py-2 hover:bg-rvc-primary-green hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            aria-hidden="true"
                                        >
                                            <path d="M5 20V10" strokeLinecap="round" />
                                            <path d="M12 20V4" strokeLinecap="round" />
                                            <path d="M19 20V14" strokeLinecap="round" />
                                        </svg>
                                        <span>See Game Report</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {game.gameOver && (
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
                        )}
                    </div>

                    {/* Bottom: First PlayerInfoDisplay (Black) */}
                    <PlayerInfoDisplay 
                        playerConfig={setupData.black}
                        playerStats={game.playersStats.B || defaultPlayerStats}
                    />
                </div>
            </div>
            {showReport && (
                <div ref={reportRef}>
                    <ReportSection 
                        setupData={setupData}
                        history={game.moveHistory}
                    />
                </div>
            )}
        </section>
    );
};

