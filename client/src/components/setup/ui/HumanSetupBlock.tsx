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
        <div className="space-y-4 h-[26.5rem] bg-gray-100 rounded-sm flex flex-col justify-center items-center">
            {/* Name Input */}
            <div className="space-y-2 w-full flex flex-col items-center">
                <label className="block text-md font-medium text-gray-700 text-center rvct-theme-500">
                    Enter Your Name:
                </label>
                <input
                    type="text"
                    value={currentName}
                    onChange={handleNameChange}
                    placeholder={defaultName}
                    className="w-3/5 max-w-xs px-3 py-2 rounded-md 
                             focus:outline-none border-2 border-rvc-primary-green focus:ring-1 focus:ring-rvc-primary-green focus:border-rvc-primary-green
                             placeholder-gray-400 text-gray-900 bg-white mx-auto"
                />
                <p className="text-xs text-gray-500 text-center rvct-theme">
                    This name will be displayed during the game
                </p>
            </div>
            <div className='h-24'></div>
        </div>
    );
}

export default HumanSetupBlock;