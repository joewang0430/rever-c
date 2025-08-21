import { PlayerConfig } from '../../../data/types/setup';
import { aiList } from '../../../data/constants/ai';


interface AISetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
    isAIAvailable: boolean;
}


const AISetupBlock = ({ playerConfig, onConfigChange, side, isAIAvailable }: AISetupBlockProps) => {
    const selectedAIId = playerConfig.config?.aiId || "";

    const handleAISelect = (aiId: string) => {
        const aiInfo = aiList[aiId];
        onConfigChange({
            ...playerConfig,
            config: {
                ...playerConfig.config,
                aiId: aiInfo.id,
                aiName: aiInfo.name,
            }
        });
    };

    return (
        <div className="h-[26.5rem] flex flex-col">
            {/* AI List (no group, but same style as archive group) */}
            <div className="flex-1 overflow-y-auto space-y-3">
                <div className="rounded-sm">
                    <div className="p-2 space-y-1 bg-gray-100 rounded-sm">
                        {Object.values(aiList).map(ai => {
                            const isDisabled = !ai.available;
                            const isSelected = selectedAIId === ai.id;
                            return (
                                <div
                                    key={ai.id}
                                    onClick={() => !isDisabled && handleAISelect(ai.id)}
                                    className={`p-3 rounded-lg transition-all border-3 ${!isDisabled ? 'group' : ''} ${
                                        isDisabled
                                            ? 'bg-gray-50 opacity-50 cursor-not-allowed border-transparent'
                                            : `cursor-pointer ${
                                                isSelected
                                                    ? 'bg-white border-rvc-primary-green'
                                                    : 'bg-white hover:bg-white border-gray-100'
                                            }`
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {ai.image && (
                                            <img src={ai.image} alt={ai.name} width={28} height={28} />
                                        )}
                                        <div className="flex-1 overflow-hidden" style={{ maskImage: 'linear-gradient(to right, black 80%, transparent 100%)' }}>
                                            <div className="flex items-baseline">
                                                <div className={`font-medium shrink-0 ${isSelected ? 'text-rvc-primary-green rvct-theme-500' : 'text-gray-700 rvct-theme-500'}`}>{ai.name}</div>
                                                <div className="relative ml-2 h-5 flex items-center">
                                                    {/* Default view: show rating if it exists */}
                                                    {ai.rating && (
                                                        <div className="text-sm text-gray-400 rvct-theme-500 whitespace-nowrap transition-all duration-200 ease-in-out transform group-hover:opacity-0 group-hover:translate-y-3">
                                                            {`${ai.rating}`}
                                                        </div>
                                                    )}
                                                    {/* Hover view: show description */}
                                                    <div className="text-sm text-gray-500 rvct-theme-500 whitespace-nowrap absolute left-0 transition-all duration-200 ease-in-out opacity-0 transform -translate-y-3 group-hover:opacity-100 group-hover:translate-y-0">
                                                        {ai.shortDescription}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AISetupBlock;