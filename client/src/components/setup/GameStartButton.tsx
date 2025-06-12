import { SetupData } from '../../data/types/setup';

interface GameStartButtonProps {
    isValid: boolean;
    onStartGame: () => void;
    setupData: SetupData;
}

const GameStartButton = ({ isValid, onStartGame, setupData }: GameStartButtonProps) => {
    return (
        <>GameStartButton</>
    );
};

export default GameStartButton;