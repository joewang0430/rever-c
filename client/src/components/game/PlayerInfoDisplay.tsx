//
// Component to display the player's information during the game.
// Under the large screen, that is the entire side bar showing the player info.
//

import { PlayerConfig } from "@/data/types/setup";
import { PlayerStats, defaultPlayerStats } from "@/data/types/game";
import { getPlayerName, getPlayerDescription, getSvgPathSetup } from "@/utils/nameConverters";
import Image from 'next/image';
import PlayerStatsLg from "@/components/game/ui/PlayerStatsLg";

interface PlayerInfoDisplayProps {
    playerConfig: PlayerConfig;
    playerStats: PlayerStats;
};

const PlayerInfoDisplay = ({ playerConfig, playerStats = defaultPlayerStats }: PlayerInfoDisplayProps) => {
    const playerName = getPlayerName(playerConfig);
    const playerDescription = getPlayerDescription(playerConfig);
    const isCode: boolean = (playerConfig.type === 'custom' || playerConfig.type === 'archive');
    const isAI: boolean = (playerConfig.type === 'ai');
    const svgPath = getSvgPathSetup(playerConfig);
    const notSelectedPath = `/svgs/setup/not-selected.svg`;

    return (
        <div className="flex flex-col justify-center items-center">
            {/* Player avatar */}
            <div className="flex justify-center items-center mb-2">
                <Image
                    src={svgPath || notSelectedPath}
                    alt="player icon"
                    width={48}
                    height={48}
                    style={{ display: 'block' }}
                />
            </div>
            <div className="text-4xl font-bold text-center">{playerName}</div>
            {/* Fixed height for description to ensure left/right alignment */}
            <div className="text-2xl text-gray-400 text-center min-h-[4rem] flex items-start justify-center">{playerDescription}</div>
            <div className="h-4"></div>
            <div className="w-full px-8">
                <PlayerStatsLg 
                    playerStats={playerStats} 
                    isCode={isCode} 
                    isAI={isAI} 
                    aiName={playerConfig.config?.aiName}
                />
            </div>
        </div>
    );
};

export default PlayerInfoDisplay;
