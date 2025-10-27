import { PlayerConfig } from '../../data/types/setup';
import { getPlayerName, 
    getPlayerDescription, 
    getSvgPathSetup, 
    getPlayerRating
} from '../../utils/nameConverters';
import Image from 'next/image';

interface SetupNameDisplayProps {
    playerConfig: PlayerConfig;
    side: 'black' | 'white';
}

const SetupNameDisplay = ({ playerConfig, side }: SetupNameDisplayProps) => {
    // const getPlayerName = (): string => {
    //     if (!playerConfig.config) {
    //         return "Not Selected";
    //     }
        
    //     switch (playerConfig.type) {
    //         case 'custom':
    //             return playerConfig.config.customName || "(Uploaded Code)";
    //         case 'archive':
    //             return playerConfig.config.archiveName || "(Historic Algorithm)";
    //         case 'human':
    //             return playerConfig.config.humanName || "(Human Player)";
    //         case 'ai':
    //             return playerConfig.config.aiName || "(AI Player)";
    //         default:
    //             return "(Not Selected)";
    //     }
    // };

    const displayName = getPlayerName(playerConfig);
    const sideLabel = side === 'black' ? 'Black' : 'White';
    const sideColor = side === 'black' ? 'text-gray-800' : 'text-gray-600';

    const typeDisplayMap: { [key: string]: string } = {
        custom: 'Upload',
        archive: 'Computer',
        human: 'Human',
        ai: 'LLM',
    };

    const typeNotationSpan = playerConfig.type && (
        <span className={`px-2 py-1 text-xs rounded-full ${
            playerConfig.type === 'custom' ? 'bg-green-100 text-green-700' :
            playerConfig.type === 'archive' ? 'bg-blue-100 text-blue-700' :
            playerConfig.type === 'human' ? 'bg-yellow-100 text-yellow-700' :
            playerConfig.type === 'ai' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-500'
        }`}>
            {typeDisplayMap[playerConfig.type]}
        </span>
    );

    const svgPath = getSvgPathSetup(playerConfig);
    const notSelectedPath = `/svgs/setup/not-selected.svg`;
    const playerDescription = getPlayerDescription(playerConfig);
    const playerRating = getPlayerRating(playerConfig);

    return (
        <div className="flex items-center space-x-2 lg:flex-col lg:items-center lg:space-x-0 lg:gap-1 lg:min-h-[5.5rem] lg:justify-center">
            {/* SVG */}
            <div className="hidden lg:flex justify-center items-center mb-1">
                <Image
                    src={svgPath || notSelectedPath}
                    alt="player icon"
                    width={48}
                    height={48}
                    style={{ display: 'block' }}
                />
            </div>

            {/* side notation (hidden on large screens) */}
            <span className={`font-medium ${sideColor} lg:hidden`}>
                {sideLabel}:
            </span>
            
            {/* player name. On large screens, it includes the type notation inline. */}
            <span
                className={
                    svgPath
                        ? "text-gray-900 font-normal lg:text-4xl lg:font-semibold lg:text-center"
                        : "font-normal lg:text-4xl lg:font-semibold lg:text-center animate-flash"
                }
                style={
                    svgPath
                        ? undefined
                        : {
                            animation: 'flashText 1.2s infinite',
                        }
                }
            >
                {displayName}
            </span>
            <style jsx>{`
                @keyframes flashText {
                    0% { color: #111827; }
                    50% { color: #d1d5db; }
                    100% { color: #111827; }
                }
            `}</style>
            {/* player description, smaller and grayer */}
            {playerDescription && (
                <span
                    className="text-sm text-gray-400 lg:text-base lg:text-center block max-w-full"
                    style={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                    }}
                >
                    {playerDescription}
                </span>
            )}
            
            {/* player type notation for small screens only */}
            {playerConfig.type && (
                <span className="lg:hidden">
                    {typeNotationSpan}
                </span>
            )}

        </div>
    );
};

export default SetupNameDisplay;