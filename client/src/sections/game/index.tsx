//
// Game page.
//

"use client";

import { useState, useEffect } from "react";
import { getSetupData } from "@/api/gameApi";
import { SetupData } from "@/data/types/setup";
import { useGame } from "@/hooks/useGame";
import PieceCountDisplay from "@/components/game/pieceCountDisplay";
import GameStatusDisplay from "@/components/game/GameStatusDisplay";

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
        <div className="flex flex-col justify-center items-center h-full">
            <GameStatusDisplay gameOver={game.gameOver} />
            <PieceCountDisplay 
                blackCount={game.playerStats.B.pieceCount}
                whiteCount={game.playerStats.W.pieceCount}
            />
            <div className="text-gray-300">
                <h1>Game Page for Match ID: {matchId}</h1>
                <pre>{JSON.stringify(setupData, null, 2)}</pre>
            </div>
            
            {/* Render game components here */}
        </div>
    );
}

