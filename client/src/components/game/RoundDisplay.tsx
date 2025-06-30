//
// Shows how many rounds right now, during the game.
//

interface RoundDisplayProps {
    placeCount: number;
};

const RoundDisplay = ({ placeCount }: RoundDisplayProps) => {
    const roundCount = Math.floor(placeCount / 2) + 1;
    return (
        <div>
            Round: {roundCount}
        </div>
    );
};

export default RoundDisplay;