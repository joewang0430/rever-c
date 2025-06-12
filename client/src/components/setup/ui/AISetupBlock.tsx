import { PlayerConfig } from '../../../data/types/setup';

interface AISetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
    isAIAvailable: boolean;
}

const AISetupBlock = ({ playerConfig, onConfigChange, side, isAIAvailable }: AISetupBlockProps) => {
    return (
        <div className="text-green-400">AISetupBlock</div>
    );
}

export default AISetupBlock;