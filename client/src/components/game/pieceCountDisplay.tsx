//
// Component to display the count of pieces in a game. At the middle upper.
//

interface PieceCountDisplayProps {
    blackCount: number;
    whiteCount: number;
};

const PieceCountDisplay = ({ blackCount, whiteCount}: PieceCountDisplayProps) => {
    return (
        <>
        <span>● {blackCount} : {whiteCount} ○</span>
        <span>{blackCount+whiteCount}</span>
        </>
    );
};

export default PieceCountDisplay;