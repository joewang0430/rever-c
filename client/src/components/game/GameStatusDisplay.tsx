//
// Simply displays the current game status: Playing or ended
//

interface GameStatusDisplayProps {
    gameOver: boolean;
};

const GameStatusDisplay = ({ gameOver }: GameStatusDisplayProps) => {
    const msg = gameOver ? 'Game Over' : 'Playing';
    return (
        <div>
            -- {msg} --
        </div>
    );

};

export default GameStatusDisplay;