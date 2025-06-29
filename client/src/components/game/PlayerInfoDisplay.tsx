//
// Component to display the player's information during the game.
// Under the large screen, that is the entire side bar showing the player info.
//

import { PlayerConfig } from "@/data/types/setup";
import { PlayerStats } from "@/data/types/game";
import { getDisplayName } from "@/utils/nameConverters";

interface PlayerInfoDisplay {
    playerConfig: PlayerConfig;
    playerStats: PlayerStats;
};

const PlayerInfoDisplay = ({ playerConfig, playerStats }: PlayerInfoDisplay) => {
    const playerName = getDisplayName(playerConfig);
    return (
        <div className="flex flex-col justify-center">
            <div className="text-4xl font-bold">{playerName}</div>
        </div>
    );
};