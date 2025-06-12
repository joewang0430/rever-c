import { PlayerConfig } from '../../../data/types/setup';

interface HumanSetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
}

const HumanSetupBlock = ({ playerConfig, onConfigChange, side }: HumanSetupBlockProps) => {
    return (
        <div className="text-green-400">HumanSetupBlock</div>
    );
}

export default HumanSetupBlock;