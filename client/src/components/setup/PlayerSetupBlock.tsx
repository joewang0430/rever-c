import { PlayerConfig } from '../../data/types/setup';

interface PlayerSetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
    matchId: string;
    isAIAvailable: boolean;
}

const PlayerSetupBlock = ({ playerConfig, onConfigChange, side }: PlayerSetupBlockProps) => {
    return (
        <>PlayerSetupBlock</>
    );
};

export default PlayerSetupBlock;