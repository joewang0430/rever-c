//
// Component to display the player's information during the game.
// Under the large screen, that is the entire side bar showing the player info.
//

import { PlayerConfig } from "@/data/types/setup";
import { PlayerStats, defaultPlayerStats } from "@/data/types/game";
import { getPlayerName, getPlayerDescription } from "@/utils/nameConverters";
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

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="text-4xl font-bold text-center">{playerName}</div>
            <div className="text-2xl text-gray-400 text-center" >{playerDescription}</div>
            <div className="h-8"></div>
            <PlayerStatsLg playerStats={playerStats} isCode={isCode} isAI={isAI} />
        </div>
    );
};

export default PlayerInfoDisplay;
