//
// Game page.
//

"use client";

import { useState, useEffect, useRef } from "react";
import { getSetupData } from "@/api/gameApi";
import { SetupData } from "@/data/types/setup";
import { useGame } from "@/hooks/useGame";
import { defaultPlayerStats, Move } from "@/data/types/game";
import PieceCountDisplay from "@/components/game/pieceCountDisplay";
import GameStatusDisplay from "@/components/game/GameStatusDisplay";
import PlayerInfoDisplay from "@/components/game/PlayerInfoDisplay";
import RoundDisplay from "@/components/game/RoundDisplay";
import GameBoard from "@/components/game/GameBoard";

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
    // const isRequestingComputer = useRef(false);
    // useEffect(() => {
    //     if (!setupData || !game.turn || game.gameOver) return;
    //     if (isRequestingComputer.current) return;   // Is requesting, return imdtl
    //     const side = game.turn === 'B' ? 'black' : 'white';

    //     const fetchComputerMove = async() => {
    //         isRequestingComputer.current = true;
    //         try {
    //             let computerMove: Move | null = null;
    //             if (setupData[side].type === 'custom' || setupData[side].type === 'archive') {
    //                 computerMove = await /* fetch code api */
    //             } else if (setupData[side].type === 'ai') {
    //                 computerMove = await /* fetch ai api */
    //             }
    //             // TODO: clean up data & exit window if not valid (related to network / basic form)
    //             // sice handleMove process some other basic error
    //             if (computerMove) { game.handleMove(computerMove); }
    //         } finally {
    //             isRequestingComputer.current = false;
    //         }
    //     }
    //     fetchComputerMove();
    // }, [game.turn, setupData, game.gameOver, game.board]);

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
                    legalMoves={game.availableMoves}     // TODO
                    setupData={setupData}
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

