//
// Gaming Page
//

"use client";

import { use } from 'react';
import Game from '@/sections/game';

interface GamePageProps {
    params: Promise<{ matchId: string }>
}

export default function GamePage({ params }: GamePageProps) {
    const { matchId } = use(params);

    return (
        <Game matchId={matchId} />
    );
}