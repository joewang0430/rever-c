import { PlayerStats } from "@/data/types/game";
import { formatElapsed } from "@/utils/nameConverters";
import StatItem from "./StatItem";

interface PlayerStatsLgProps {
    playerStats: PlayerStats;
    isCode: boolean;
    isAI?: boolean;
}

const PlayerStatsLg = ({ playerStats, isCode, isAI = false }: PlayerStatsLgProps) => {
    return (
        <div className="bg-gray-200 w-full rounded-lg min-h-96 flex flex-col items-center justify-center px-4">
            <StatItem 
                label="Available Moves" 
                value={playerStats.mobility === 0 ? '-' : playerStats.mobility} 
            />

            {isCode && (
                <>
                    <StatItem 
                        label="Thinking Time" 
                        value={playerStats.time === 0 ? '-' : formatElapsed(playerStats.time)} 
                    />
                    <StatItem 
                        label="Total Thinking" 
                        value={playerStats.totalTime === 0 ? '-' : formatElapsed(playerStats.totalTime)} 
                    />
                    <StatItem 
                        label="Maximum Thinking" 
                        value={playerStats.maxTime === 0 ? '-' : formatElapsed(playerStats.maxTime)} 
                    />
                    <StatItem 
                        label="Code Return Value" 
                        value={playerStats.returnValue ?? '-'} 
                    />
                </>
            )}

            {isAI && (
                <>
                    <div className="mt-4">Explanation</div>
                    <div>{playerStats.explanation}</div>
                </>
            )}
        </div>
    );
};

export default PlayerStatsLg;
