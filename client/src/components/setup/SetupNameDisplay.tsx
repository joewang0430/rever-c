import { PlayerConfig } from '../../data/types/setup';

interface SetupNameDisplayProps {
    playerConfig: PlayerConfig;
    side: 'black' | 'white';
}

const SetupNameDisplay = ({ playerConfig, side }: SetupNameDisplayProps) => {
    return (
        <>SetupNameDisplay</>
    );
};

export default SetupNameDisplay;