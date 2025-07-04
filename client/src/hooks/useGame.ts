//
// Managing game state for a board game.
//

import { useState, useEffect } from 'react';
import { SetupData } from '../data/types/setup';
import { 
    Draw,
    Turn,
    Board,
    Move, 
    CertificateType,
    createInitialBoard, 
    PlayerStats, 
    MoveHistoryItem 
} from '@/data/types/game';
import { 
    raiseGameErrorWindow, 
    checkLegalMove,
    getUpdatedBoard,
    toggleTurn,
    checkGameOver,
    getPieceCount,
    getMobility
} from '@/utils/gameLogic';
import { getPlayerName } from '@/utils/nameConverters';

export const useGame = (setupData: SetupData | null) => {
    const [board, setBoard] = useState<Board>(() => setupData ? createInitialBoard(setupData.boardSize) : []); 
    const [turn, setTurn] = useState<Turn | null>('B');
    const [move, setMove] = useState<Move | null>(null);
    const [lastMove, setLastMove] = useState<Move | null>(null);
    const [placeCount, setPlaceCount] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const [playersStats, setPlayersStats] = useState<{ B: PlayerStats; W: PlayerStats }>({
        B: { pieceCount: 2, mobility: 4, flips: 0, totalTime: 0, maxTime: 0, returnValue: null },
        W: { pieceCount: 2, mobility: 4, flips: 0, totalTime: 0, maxTime: 0, returnValue: null }
    });

    const [flipped, setFlipped] = useState<Move[]>([]);
    const [availableMoves, setAvailableMoves] = useState<Move[]>([]);

    const [winner, setWinner] = useState<Turn | Draw | null>(null);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [certificate, setCertificate] = useState<CertificateType | null>(null);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([]);

    useEffect(() => {
        if (setupData) {
            setBoard(createInitialBoard(setupData.boardSize));
            setTurn('B');
            setMove(null);
            setLastMove(null);
            setFlipped([]);
            setAvailableMoves([]);
            setPlaceCount(0);
            setGameOver(false);
            setPlayersStats({
                B: { pieceCount: 2, mobility: 4, flips: 0, totalTime: 0, maxTime: 0, returnValue: null },
                W: { pieceCount: 2, mobility: 4, flips: 0, totalTime: 0, maxTime: 0, returnValue: null }
            });
            setWinner(null);
            setErrorState(null);
            setCertificate(null);
            setMoveHistory([]);
        }
    }, [setupData]);

    const handleMove = async(move: Move) => {
        if (!setupData) return;
        if (gameOver) return;
        if (!turn) return;

        const size = setupData.boardSize;

        /* check the validity first */
        const legalCheck = checkLegalMove(board, turn, move, size);
        if (!legalCheck.valid) {
            // TODO: set error state

            let color = 'unknown color';
            let playerName = 'unknown player'
            if (turn === 'B') {
                color = 'black';
                playerName = setupData ? getPlayerName(setupData.black) : playerName;
            } else if (turn === 'W') {
                color = 'white';
                playerName = setupData ? getPlayerName(setupData.white) : playerName;
            }
            const msg = `The ${color} player, ${playerName}, made a invalid move, thus the game quit unexpectedly.`
            raiseGameErrorWindow(msg);
            return;
        }

        /* UPDATE */

        // Board, FlipsCount, Flipped
        const { newBoard: newBoard, flipsCount: flipsCount, flippedPositions: flippedPositions } = getUpdatedBoard(board, turn, move, size);
        setFlipped(flippedPositions);
        setBoard(newBoard);

        // TODO: set time out (maybe)
        
        // PlaceCount
        setPlaceCount(prev => prev + 1);

        // PlayerStats: pieceCount, mobility; available moves
        const blackPieceCount = getPieceCount(newBoard, 'B', size);
        const whitePieceCount = getPieceCount(newBoard, 'W', size);
        
        // Mobility of next turn:
        const {mobility: nextMobility, availableMoves: nextAvailableMoves} = getMobility(newBoard, toggleTurn(turn), size);
        const {mobility: currMobility, availableMoves: currAvailableMoves} = getMobility(newBoard, turn, size);

        if (turn === 'B') {
            // for the being-flipped side, just keep the flips & mobility this round to be    
            // the same with previous move
            setPlayersStats(prev => ({
                B: {
                    ...prev.B,
                    flips: flipsCount,
                    pieceCount: blackPieceCount,
                },
                W: {
                    ...prev.W,
                    pieceCount: whitePieceCount,
                    mobility: nextMobility
                }
            }));
        } else {
            setPlayersStats(prev => ({
                B: {
                    ...prev.B,
                    pieceCount: blackPieceCount,
                    mobility: nextMobility
                },
                W: {
                    ...prev.W,
                    flips: flipsCount,
                    pieceCount: whitePieceCount,
                }
            }));
        }
        setAvailableMoves(nextAvailableMoves);

        // moveHistory
        setMoveHistory(prev => [
            ...prev, 
            {
                index: prev.length + 1,
                color: turn,
                position: { row: move.row, col: move.col },
                pieceCount: { B: blackPieceCount, W: whitePieceCount },
                mobility: {
                    B: turn === 'B' ? prev[prev.length-1]?.mobility.B ?? 4 : nextMobility,
                    W: turn === 'W' ? prev[prev.length-1]?.mobility.W ?? 4 : nextMobility,
                 }
            }
        ]);

        // GameOver?
        const isGameOver = checkGameOver(newBoard, size);
        setGameOver(isGameOver);

        // Winner
        let gameWinner: Turn | Draw | null = null;
        if (isGameOver) {
            if (blackPieceCount > whitePieceCount) {
                gameWinner = 'B'
            } else if (blackPieceCount < whitePieceCount) {
                gameWinner = 'W'
            } else {
                gameWinner = 'D';
            }
            setWinner(gameWinner);
        }

        // Certificate
        if (isGameOver) {
            // Code challenger wins in black
            if (setupData.black.type === 'custom' && setupData.white.type === 'archive' && gameWinner === 'B') {
                setCertificate('IN BLACK');
            // Code challenger wins in white
            } else if (setupData.black.type === 'archive' && setupData.white.type === 'custom' && gameWinner === 'W') {
                setCertificate('IN WHITE');
            // Draw / Lose / Other modes
            } else {
                setCertificate(null);
            }
        }

        // Turn & Waiter
        if (gameOver) {
            setTurn(null);
        } else {
            const nextTurn = toggleTurn(turn);

            if (nextMobility > 0) {
                // Next opponent move is available
                setTurn(nextTurn);
            } else if (currMobility > 0) {
                // Next opponent move is NOT available
                // then still this side
                setTurn(turn);
            } else {
                // nextMobility = currMobility = 0
                // This means game over, keep for safety
                setGameOver(true);
                setTurn(null);
            }
        }

        // lastMove
        setLastMove(move);
    };

    return {
        board,
        turn,
        move,
        lastMove,
        flipped,
        availableMoves,
        placeCount,
        gameOver,
        playersStats,
        winner,
        errorState,
        certificate,
        moveHistory,

        setBoard,
        setTurn,
        setMove,
        setLastMove,
        setFlipped,
        setAvailableMoves,
        setPlaceCount,
        setGameOver,
        setPlayersStats,
        setWinner,
        setErrorState,
        setCertificate,
        setMoveHistory,

        handleMove,
    };
};

