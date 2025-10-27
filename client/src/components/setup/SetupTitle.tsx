import Image from 'next/image';

interface GameScore {
    black: number;
    white: number;
}

interface SetupTitleProps {
    // Where this title is used
    context: 'setup' | 'game';
    // Live score when used in the game context
    score?: GameScore;
    // Whether the game has ended (adds a small caption above the score)
    gameOver?: boolean;
}

const SetupTitle = ({ context, score, gameOver = false }: SetupTitleProps) => {
    const renderCenter = () => {
        // Fixed width wrapper only for game context to avoid layout shift when score length changes
        const CenterWrap = ({ children }: { children: React.ReactNode }) => (
            <div className="flex flex-col items-center w-[108px] flex-shrink-0 text-center">
                {children}
            </div>
        );

        if (context === 'setup') {
            // No fixed width in setup; keep original compact spacing
            return (
                <span className="text-2xl text-gray-500 rvct-theme-500">VS</span>
            );
        }

        // context === 'game'
        const left = score?.black ?? 0;
        const right = score?.white ?? 0;
        const scoreStr = `${left} : ${right}`;
        // If longer than "100 : 10" (length 8), reduce font from 2xl to xl
        const fontSizeClass = scoreStr.length >= 8 ? 'text-xl' : 'text-2xl';
        return (
            <CenterWrap>
                {gameOver && (
                    <span className="text-xs text-gray-500 mb-1">Game Over</span>
                )}
                <span className={`${fontSizeClass} text-gray-700 tabular-nums font-mono`}>
                    {left} : {right}
                </span>
            </CenterWrap>
        );
    };

    return (
        <div className="flex justify-center items-center gap-5">
            {/* Left Side: Black */}
            <Image
                src="/svgs/setup/setup_black.svg"
                alt="Black"
                width={112}
                height={39}
            />

            {/* Center: VS or Score (+ optional Game Over) */}
            {renderCenter()}

            {/* Right Side: White */}
            <Image
                src="/svgs/setup/setup_white.svg"
                alt="White"
                width={112}
                height={39}
            />
        </div>
    );
};

export default SetupTitle;