//
// Gaming Page
//

"use client";

import { use } from 'react';

interface GamePageProps {
    params: Promise<{ matchId: string }>
}

export default function GamePage({ params }: GamePageProps) {
    const { matchId } = use(params);

    // Here it would typically fetch the game state based on matchId
    // For now, we just return a placeholder component
    return (
        <div>
            <h1>Game Page for Match ID: {matchId}</h1>
            {/* Render game components here */}
        </div>
    );
}