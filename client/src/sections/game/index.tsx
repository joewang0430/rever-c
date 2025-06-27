//
// Game page.
//

"use client";

interface GameProps {
    matchId: string;
}

export default function Game({ matchId}: GameProps) {
    return (
        <div>
            <h1>Game Page for Match ID: {matchId}</h1>
            {/* Render game components here */}
        </div>
    );
}

