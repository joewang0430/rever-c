//
//  Human mode setup block in the setup page
//

import { PlayerConfig } from '../../../data/types/setup';

interface HumanSetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
}

const HumanSetupBlock = ({ playerConfig, onConfigChange, side }: HumanSetupBlockProps) => {
    const defaultName = side === 'black' ? 'Player B' : 'Player W';
    const currentName = playerConfig.config?.humanName ?? "";

    // Handle name change
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        
        onConfigChange({
            ...playerConfig,
            config: {
                ...playerConfig.config,
                humanName: newName
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Title */}
            <div className="flex items-center space-x-2">
                <span className="text-2xl">👤</span>
                <h3 className="text-lg font-semibold text-gray-800">
                    Human Player Setup
                </h3>
            </div>
            
            {/* Name Input */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Player Name
                </label>
                <input
                    type="text"
                    value={currentName}
                    onChange={handleNameChange}
                    placeholder={defaultName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             placeholder-gray-400 text-gray-900"
                />
                {(playerConfig.config?.humanName ?? "").trim() === "" && (
                    <p className="text-xs text-red-500">
                        Name cannot be empty
                    </p>
                )}
                <p className="text-xs text-gray-500">
                    This name will be displayed during the game
                </p>
            </div>
        </div>
    );
}

export default HumanSetupBlock;