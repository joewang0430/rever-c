import { PlayerConfig } from '../../data/types/setup';

interface SetupNameDisplayProps {
    playerConfig: PlayerConfig;
    side: 'black' | 'white';
}

const SetupNameDisplay = ({ playerConfig, side }: SetupNameDisplayProps) => {
    const getDisplayName = (): string => {
        if (!playerConfig.config) {
            return "Not Selected";
        }
        
        switch (playerConfig.type) {
            case 'custom':
                return playerConfig.config.customName || "(Uploaded Code)";
            case 'archive':
                return playerConfig.config.archiveName || "(Historic Algorithm)";
            case 'human':
                return playerConfig.config.humanName || "(Human Player)";
            case 'ai':
                return playerConfig.config.aiName || "(AI Player)";
            default:
                return "(Not Selected)";
        }
    };

    const displayName = getDisplayName();
    const sideLabel = side === 'black' ? 'Black' : 'White';
    const sideColor = side === 'black' ? 'text-gray-800' : 'text-gray-600';

    return (
        <div className="flex items-center space-x-2">
            {/* 侧边标识 */}
            <span className={`font-medium ${sideColor}`}>
                {sideLabel}:
            </span>
            
            {/* 玩家名称 */}
            <span className="text-gray-900 font-normal">
                {displayName}
            </span>
            
            {/* 类型标识（小标签） */}
            {playerConfig.type && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                    playerConfig.type === 'custom' ? 'bg-green-100 text-green-700' :
                    playerConfig.type === 'archive' ? 'bg-blue-100 text-blue-700' :
                    playerConfig.type === 'human' ? 'bg-yellow-100 text-yellow-700' :
                    playerConfig.type === 'ai' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-500'
                }`}>
                    {playerConfig.type}
                </span>
            )}
        </div>
    );
    
};

export default SetupNameDisplay;