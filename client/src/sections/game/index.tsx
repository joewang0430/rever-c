//
// Game page.
//

"use client";

import { useState, useEffect } from "react";
import { getSetupData } from "@/api/gameApi";
import { SetupData } from "@/data/types/setup";
import { useGame } from "@/hooks/useGame";
import { defaultPlayerStats } from "@/data/types/game";
import PieceCountDisplay from "@/components/game/pieceCountDisplay";
import GameStatusDisplay from "@/components/game/GameStatusDisplay";
import PlayerInfoDisplay from "@/components/game/PlayerInfoDisplay";
import RoundDisplay from "@/components/game/RoundDisplay";

interface GameProps {
    matchId: string;
}

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
                
                {/* Render game components here */}
            </div>
            <div>
                <PlayerInfoDisplay 
                    playerConfig={setupData.white}
                    playerStats={game.playersStats.W || defaultPlayerStats}
                />
            </div>
        </div>
    );
}

