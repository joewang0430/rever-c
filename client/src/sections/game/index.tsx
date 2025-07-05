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
import { raiseGameErrorWindow } from "@/utils/gameLogic";

interface GameProps {
    matchId: string;
};

export default function Game({ matchId}: GameProps) {
    const [setupData, setSetupData] = useState<SetupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const game = useGame(setupData);

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

        const fetchComputerMove = async() => {
            isRequestingComputer.current = true;
            try {
                let computerMove: FetchCodeMoveResult | null = null;

                if (setupData[side].type === 'custom') {
                    const customPlayerType = setupData[side].config?.customType;
                    const customPlayerCodeId = setupData[side].config?.customCodeId;

                    if (!customPlayerType || !customPlayerCodeId) {
                        raiseGameErrorWindow("Uploaded code config is missing.");
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
                        raiseGameErrorWindow("Archived code config is missing.");
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
                if (computerMove) { 
                    game.handleMove(computerMove.move); 
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                raiseGameErrorWindow(errorMsg);
            } finally {
                isRequestingComputer.current = false;
            }
        }
        fetchComputerMove();
    }, [game.turn, setupData, game.gameOver, game.board]);

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
                <div className="text-gray-300">
                    <h1>Game Page for Match ID: {matchId}</h1>
                    <pre>{JSON.stringify(setupData, null, 2)}</pre>
                </div>
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

