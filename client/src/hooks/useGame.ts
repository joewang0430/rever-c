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
    PlayerStats, 
    MoveHistoryItem 
} from '@/data/types/game';
import { 
    getInitialAvailableMoves,
    raiseGameErrorWindow, 
    checkLegalMove,
    getUpdatedBoard,
    toggleTurn,
    checkGameOver,
    getPieceCount,
    getMobility,
    createInitialBoard, 
    clearCandidate
} from '@/utils/gameLogistics';
import { getPlayerName } from '@/utils/nameConverters';
import { useRouter } from 'next/navigation';
import { incrementStats } from '@/api/statsApi';

export const useGame = (setupData: SetupData | null) => {
    const [board, setBoard] = useState<Board>(() => setupData ? createInitialBoard(setupData.boardSize) : []); 
    const [turn, setTurn] = useState<Turn | null>('B');
    const [move, setMove] = useState<Move | null>(null);
    const [lastMove, setLastMove] = useState<Move | null>(null);
    const [placeCount, setPlaceCount] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const [playersStats, setPlayersStats] = useState<{ B: PlayerStats; W: PlayerStats }>({
        B: { pieceCount: 2, mobility: 4, flips: 0, time:0, totalTime: 0, maxTime: 0, returnValue: null },
        W: { pieceCount: 2, mobility: 0, flips: 0, time:0, totalTime: 0, maxTime: 0, returnValue: null }
    });

    const [flipped, setFlipped] = useState<Move[]>([]);
    const [availableMoves, setAvailableMoves] = useState<Move[]>(
        setupData ? getInitialAvailableMoves(setupData.boardSize) : []
    );
    const [isEcho, setIsEcho] = useState<boolean>(false);

    const [winner, setWinner] = useState<Turn | Draw | null>(null);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [certificate, setCertificate] = useState<CertificateType | null>(null);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([]);

    const router = useRouter();

    useEffect(() => {
        if (setupData) {
            setBoard(createInitialBoard(setupData.boardSize));
            setTurn('B');
            setMove(null);
            setLastMove(null);
            setFlipped([]);
            setAvailableMoves(getInitialAvailableMoves(setupData.boardSize));
            setIsEcho(false);
            setPlaceCount(0);
            setGameOver(false);
            setPlayersStats({
                B: { pieceCount: 2, mobility: 4, flips: 0, time:0, totalTime: 0, maxTime: 0, returnValue: null },
                W: { pieceCount: 2, mobility: 0, flips: 0, time:0, totalTime: 0, maxTime: 0, returnValue: null }
            });
            setWinner(null);
            setErrorState(null);
            setCertificate(null);
            setMoveHistory([]);
        }
    }, [setupData]);

    const handleMove = async(move: Move, elapsedTime?: number) => {
        console.log("handleMove called.")
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
            raiseGameErrorWindow(setupData, msg, () => {router.push("/setup")});
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

        // PlayerStats: pieceCount, mobility; available moves, time
        const blackPieceCount = getPieceCount(newBoard, 'B', size);
        const whitePieceCount = getPieceCount(newBoard, 'W', size);
        const blackTime = playersStats.B.time;
        const whiteTime = playersStats.W.time;
        
        // Mobility of next turn:
        // echoMobility: this is tricky, this means if the opponent next has 0 move and back to us, how many moves we have then
        const {mobility: nextMobility, availableMoves: nextAvailableMoves} = getMobility(newBoard, toggleTurn(turn), size);
        const {mobility: echoMobility, availableMoves: echoAvailableMoves} = getMobility(newBoard, turn, size);

        if (turn === 'B') {
            // For the being-flipped side, set to 0 if not your turn
            // but for the mobility, keep the previous version
            setPlayersStats(prev => ({
                B: {
                    ...prev.B,
                    flips: flipsCount,
                    pieceCount: blackPieceCount,
                    // mobility: 0
                },
                W: {
                    ...prev.W,
                    flips: 0,
                    pieceCount: whitePieceCount,
                    mobility: nextMobility
                }
            }));
        } else {
            setPlayersStats(prev => ({
                B: {
                    ...prev.B,
                    flips: 0,
                    pieceCount: blackPieceCount,
                    mobility: nextMobility
                },
                W: {
                    ...prev.W,
                    flips: flipsCount,
                    pieceCount: whitePieceCount,
                    // mobility: 0
                }
            }));
        }
        // setAvailableMoves(nextAvailableMoves);

        // moveHistory
        setMoveHistory(prev => [
            ...prev, 
            {
                step: prev.length + 1,
                color: turn,
                position: { row: move.row, col: move.col },
                pieceCount: { B: blackPieceCount, W: whitePieceCount },
                mobility: { 
                // Our mobility this round is the mobility focused on this move round (about to move)
                // Opponent's molitily this round is the it's mobility after this move
                    B: turn === 'B' ? prev[prev.length-1]?.mobility.B ?? 4 : nextMobility,
                    W: turn === 'W' ? prev[prev.length-1]?.mobility.W ?? 4 : nextMobility
                },
                flips: {
                // Our flips this round is the # of opponent pieces flipped by us this move
                // Opponent's flips this round is 0, nothing, this is different from the mobility before
                    B: turn === 'B' ? flipsCount : 0,
                    W: turn === 'W' ? flipsCount : 0
                },
                // "time" is the time that code took to move this round. It only works for type "archive" and "custom"
                // otherwise the time data is always 0
                time: {
                    B: (turn === 'B' && (setupData.black.type === 'custom' || setupData.black.type === 'archive'))
                        ? elapsedTime ?? 0
                        : prev.length > 0 ? prev[prev.length - 1].time.B : 0,
                    W: (turn === 'W' && (setupData.white.type === 'custom' || setupData.white.type === 'archive'))
                        ? elapsedTime ?? 0
                        : prev.length > 0 ? prev[prev.length - 1].time.W : 0,
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

        // Clear Data
            clearCandidate(setupData);

        // Increment total games count
            incrementStats().catch(err => console.error("Failed to increment stats:", err));
        }

        // Turn & Available Moves & echo
        if (gameOver) {
            setTurn(null);
            setAvailableMoves([]);
        } else {
            const nextTurn = toggleTurn(turn);

            if (nextMobility > 0) {
                // Next opponent move is available
                setAvailableMoves(nextAvailableMoves);
                setIsEcho(false);
                setTurn(nextTurn);
            } else if (echoMobility > 0) {
                // Next opponent move is NOT available
                // then still this side
                setAvailableMoves(echoAvailableMoves);
                setIsEcho(true);
                setTurn(turn);
            } else {
                // nextMobility = echoMobility = 0
                // This means game over, keep for safety
                setAvailableMoves([]);
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
        isEcho,
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
        setIsEcho,
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

