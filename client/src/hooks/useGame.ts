//
// Managing game state for a board game.
//

import { useState, useEffect } from 'react';
import { SetupData } from '../data/types/setup';
import { Turn,
    Board,
    Move, 
    createInitialBoard, 
    PlayerStats, 
    MoveHistoryItem 
} from '@/data/types/game';
import { raiseGameErrorWindow, checkLegalMove } from '@/utils/gameLogic';
import { getPlayerName } from '@/utils/nameConverters';

export const useGame = (setupData: SetupData | null) => {
    const [board, setBoard] = useState<Board>(() => setupData ? createInitialBoard(setupData.boardSize) : []); 
    const [turn, setTurn] = useState<Turn>('B');
    const [move, setMove] = useState<Move | null>(null);
    const [placeCount, setPlaceCount] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const [playersStats, setPlayersStats] = useState<{ B: PlayerStats; W: PlayerStats }>({
        B: { pieceCount: 2, mobility: 4, flips: 0, totalTime: 0, maxTime: 0, returnValue: null },
        W: { pieceCount: 2, mobility: 4, flips: 0, totalTime: 0, maxTime: 0, returnValue: null }
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
                B: { pieceCount: 2, mobility: 4, flips: 0, totalTime: 0, maxTime: 0, returnValue: null },
                W: { pieceCount: 2, mobility: 4, flips: 0, totalTime: 0, maxTime: 0, returnValue: null }
            });
            setWaiter(null);
            setWinner(null);
            setErrorState(null);
            setCertificateReady(false);
            setMoveHistory([]);
        }
    }, [setupData]);

    const handleMove = async(board: Board, turn: Turn, move: Move) => {
        if (!checkLegalMove(board, turn, move)) {
            // TODO: set error state

            let color = 'unknown color';
            let playerName = 'unknown player'
            if (turn === 'B') {
                color = 'black';
                playerName = setupData ? getPlayerName(setupData?.black) : playerName;
            } else if (turn === 'W') {
                color = 'white';
                playerName = setupData ? getPlayerName(setupData?.white) : playerName;
            }
            const msg = `The ${color} player, ${playerName}, made a invalid move, thus the game quit unexpectedly. Select `
            raiseGameErrorWindow(msg);
        }


    };

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

