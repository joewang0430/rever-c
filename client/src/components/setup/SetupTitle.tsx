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
        if (context === 'setup') {
            return (
                <span className="text-2xl text-gray-500 rvct-theme-500">VS</span>
            );
        }

        // context === 'game'
        const left = score?.black ?? 0;
        const right = score?.white ?? 0;
        return (
            <div className="flex flex-col items-center">
                {gameOver && (
                    <span className="text-xs text-gray-500 mb-1">Game Over</span>
                )}
                <span className="text-2xl text-gray-700">
                    {left} : {right}
                </span>
            </div>
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