import { useState, useEffect } from 'react';
import { SetupData } from '../data/types/setup';
import { Move, 
    createInitialBoard, 
    Turn, 
    PlayerStats, 
    MoveHistoryItem 
} from '@/data/types/game';

export const useGame = (setupData: SetupData) => {
    const [board, setBoard] = useState<string[][]>(() => createInitialBoard(setupData.boardSize)); 
    const [turn, setTurn] = useState<Turn>('B');
    const [move, setMove] = useState<Move | null>(null);
    const [placeCount, setPlaceCount] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const [playerStats, setPlayerStats] = useState<{ B: PlayerStats; W: PlayerStats }>({
        B: { pieceCount: 2, mobility: 4 },
        W: { pieceCount: 2, mobility: 4 }
    });

    const [waiter, setWaiter] = useState<Turn | null>(null);
    const [winner, setWinner] = useState<Turn | null>(null);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [certificateReady, setCertificateReady] = useState<boolean>(false);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([]);
};

