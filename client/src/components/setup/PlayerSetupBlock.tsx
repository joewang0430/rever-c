import { PlayerConfig, BoardSize } from '../../data/types/setup';
import CustomSetupBlock from './ui/CustomSetupBlock';
import ArchiveSetupBlock from './ui/ArchiveSetupBlock';
import HumanSetupBlock from './ui/HumanSetupBlock';
import AISetupBlock from './ui/AISetupBlock';
import NullSetupBlock from './ui/NullSetupBlock';


interface PlayerSetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
    isAIAvailable: boolean;
    boardSize: BoardSize;
}

const PlayerSetupBlock = ({ playerConfig, onConfigChange, side, isAIAvailable, boardSize }: PlayerSetupBlockProps) => {

    const renderPlayerSetup = () => {
    switch (playerConfig.type) {
        case "custom":
            return (
                <CustomSetupBlock 
                    playerConfig={playerConfig}
                    onConfigChange={onConfigChange}
                    side={side}
                />
            );
            
        case "archive":
            return (
                <ArchiveSetupBlock 
                    playerConfig={playerConfig}
                    onConfigChange={onConfigChange}
                    side={side}
                    boardSize={boardSize}
                />
            );
            
        case "human":
            return (
                <HumanSetupBlock 
                    playerConfig={playerConfig}
                    onConfigChange={onConfigChange}
                    side={side}
                />
            );
            
        case "ai":
            return (
                <AISetupBlock 
                    playerConfig={playerConfig}
                    onConfigChange={onConfigChange}
                    side={side}
                    isAIAvailable={isAIAvailable}
                />
            );
            
        case null:
            return <NullSetupBlock />;
            
        default:
            return <NullSetupBlock />;
    }
};

    let title = "Player Setup";
    switch (playerConfig.type) {
        case "custom":
            title = "Upload Code";
            break;
        case "archive":
            title = "Select Bot";
            break;
        case "human":
            title = "Human Player";
            break;
        case "ai":
            title = "Select Model";
            break;
        default:
            title = "Player Setup";
    }
    return (
        <div className="bg-gray-200 p-4 h-full flex flex-col rounded rounded-lg">
            <div className="mb-2 text-base font-semibold text-gray-600 text-center">{title}</div>
            {renderPlayerSetup()}
        </div>
    );
};

export default PlayerSetupBlock;