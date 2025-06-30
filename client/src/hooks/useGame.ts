//
// Managing game state for a board game.
//

import { useState, useEffect } from 'react';
import { SetupData } from '../data/types/setup';
import { Move, 
    createInitialBoard, 
    Turn, 
    PlayerStats, 
    MoveHistoryItem 
} from '@/data/types/game';

export const useGame = (setupData: SetupData | null) => {
    const [board, setBoard] = useState<string[][]>(() => setupData ? createInitialBoard(setupData.boardSize) : []); 
    const [turn, setTurn] = useState<Turn>('B');
    const [move, setMove] = useState<Move | null>(null);
    const [placeCount, setPlaceCount] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const [playersStats, setPlayersStats] = useState<{ B: PlayerStats; W: PlayerStats }>({
        B: { pieceCount: 2, mobility: 4, totalTime: 0, maxTime: 0, returnValue: null },
        W: { pieceCount: 2, mobility: 4, totalTime: 0, maxTime: 0, returnValue: null }
    });

    const [waiter, setWaiter] = useState<Turn | null>(null);
    const [winner, setWinner] = useState<Turn | null>(null);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [certificateReady, setCertificateReady] = useState<boolean>(false);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([]);

    useEffect(() => {
        if (setupData) {
            setBoard(createInitialBoard(setupData.boardSize));
            setTurn('B');
            setMove(null);
            setPlaceCount(0);
            setGameOver(false);
            setPlayersStats({
                B: { pieceCount: 2, mobility: 4, totalTime: 0, maxTime: 0, returnValue: null },
                W: { pieceCount: 2, mobility: 4, totalTime: 0, maxTime: 0, returnValue: null }
            });
            setWaiter(null);
            setWinner(null);
            setErrorState(null);
            setCertificateReady(false);
            setMoveHistory([]);
        }
    }, [setupData]);

    return {
        board,
        turn,
        move,
        placeCount,
        gameOver,
        playersStats,
        waiter,
        winner,
        errorState,
        certificateReady,
        moveHistory,

        setBoard,
        setTurn,
        setMove,
        setPlaceCount,
        setGameOver,
        setPlayersStats,
        setWaiter,  
        setWinner,
        setErrorState,
        setCertificateReady,
        setMoveHistory
    };
};

