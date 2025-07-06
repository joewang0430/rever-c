//
// Game page.
//

"use client";

import { useState, useEffect, useRef } from "react";
import { getSetupData } from "@/api/gameApi";
import { SetupData } from "@/data/types/setup";
import { useGame } from "@/hooks/useGame";
import PieceCountDisplay from "@/components/game/pieceCountDisplay";
import GameStatusDisplay from "@/components/game/GameStatusDisplay";
import PlayerInfoDisplay from "@/components/game/PlayerInfoDisplay";
import RoundDisplay from "@/components/game/RoundDisplay";
import GameBoard from "@/components/game/GameBoard";
import { 
    defaultPlayerStats, 
    Move, 
    Turn,
    FetchCodeMoveParams, 
    FetchCodeMoveResult
} from "@/data/types/game";
import { getSetupTurnName } from "@/utils/nameConverters";
import { fetchCustomMove, fetchArchiveMove } from "@/api/playApi";
import { raiseGameErrorWindow } from "@/utils/gameLogistics";
import { useRouter } from 'next/navigation';

interface GameProps {
    matchId: string;
};

export default function Game({ matchId}: GameProps) {
    const [setupData, setSetupData] = useState<SetupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const game = useGame(setupData);

    const router = useRouter();

    useEffect(() => {
        if (!matchId) return;
        setLoading(true);
        getSetupData(matchId)
            .then((data) => {
                setSetupData(data.setupData);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Failed to fetch setup data");
                setLoading(false);
            })
    }, [matchId]);

    // _____ uncomment this later ____

    // Process the move from computer ("custom" | "archive" | "ai")
    const isRequestingComputer = useRef(false);
    useEffect(() => {
        if (!setupData || !game.turn || game.gameOver) return;
        if (isRequestingComputer.current) return;   // Is requesting, return imdtl
        const side = getSetupTurnName(game.turn);
        const turn = game.turn;

        const fetchComputerMove = async() => {
            isRequestingComputer.current = true;
            try {
                let computerMove: FetchCodeMoveResult | null = null;
                const delayPromise = new Promise(resolve => setTimeout(resolve, 500));

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
                }
                // else if (setupData[side].type === 'ai') {
                //     computerMove = await /* fetch ai api */  // TODO: implement AI
                // }
                // TODO: clean up data & exit window if not valid (related to network / basic form)
                // sice handleMove process some other basic error

                await delayPromise; // Ensure at leas wait 0.5s

                if (computerMove) { 
                    game.handleMove(computerMove.move); 

                    if (setupData[side].type !== 'ai') {
                        game.setPlayersStats(prev => {
                            const newStats = { ...prev };
                            newStats[turn] = {
                                ...newStats[turn],
                                // Accumulate total thinking time
                                totalTime: (newStats[turn].totalTime || 0) + (computerMove.elapsed || 0),
                                // Update max thinking time
                                maxTime: Math.max(newStats[turn].maxTime || 0, computerMove.elapsed || 0),
                                // Update returnValue
                                returnValue: computerMove.returnValue ?? null,
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

    // _____ uncomment this later ____

    if (loading) return <div>Loading game data...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!setupData) return <div>No setup data found.</div>;

    return (
        <div className="flex flex-row justify-center">
            <div>
                <PlayerInfoDisplay 
                    playerConfig={setupData.black}
                    playerStats={game.playersStats.B || defaultPlayerStats}/>
            </div>
            <div className="flex flex-col justify-center items-center h-full">
                <GameStatusDisplay gameOver={game.gameOver} />
                <PieceCountDisplay 
                    blackCount={game.playersStats.B.pieceCount}
                    whiteCount={game.playersStats.W.pieceCount}
                />
                <RoundDisplay placeCount={game.placeCount} />
                
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
                />

                <div className="text-gray-300">
                    <h1>Game Page for Match ID: {matchId}</h1>
                    <pre>{JSON.stringify(setupData, null, 2)}</pre>
                </div>
                
                {/* Debug: show all useGame data */}
                <div>
                    <pre>{JSON.stringify(game, null, 2)}</pre>
                </div>
            </div>
            <div>
                <PlayerInfoDisplay 
                    playerConfig={setupData.white}
                    playerStats={game.playersStats.W || defaultPlayerStats}
                />
            </div>
        </div>
    );
};

