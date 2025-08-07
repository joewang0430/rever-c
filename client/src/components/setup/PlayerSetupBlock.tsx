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

    return (
        <div className="bg-white p-4 h-full flex flex-col border-2 border-gray-200 rounded">
            {/* <div className="mb-4 text-center">
                <div className={`
                    w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold
                    ${side === 'black' ? 'bg-black' : 'bg-gray-600'}
                `}>
                    {side === 'black' ? 'B' : 'W'}
                </div>
                <h3 className="text-lg font-semibold capitalize">
                    {side === 'black' ? 'Black Player (First)' : 'White Player (Second)'}
                </h3>
                {playerConfig.type && (
                    <p className="text-sm text-gray-600 mt-1">
                        Type: {playerConfig.type}
                    </p>
                )}
            </div> */}
                {renderPlayerSetup()}
        </div>
    );
};

export default PlayerSetupBlock;