import { PlayerStats } from "@/data/types/game";
import { formatElapsed } from "@/utils/nameConverters";

interface PlayerStatsLgProps {
    playerStats: PlayerStats;
    isCode: boolean;
    isAI?: boolean;
}

const PlayerStatsLg = ({ playerStats, isCode, isAI = false }: PlayerStatsLgProps) => {
    return (
        <div>
            <div className="mt-4">Available Moves</div>
            <div>{playerStats.mobility === 0 ? '-' : playerStats.mobility}</div>

            {isCode && (
                <>
                    <div className="mt-4">Thinking Time:</div>
                    <div>{playerStats.time === 0 ? '-' : formatElapsed(playerStats.time)}</div>
                    <div className="mt-4">Total Thinking</div>
                    <div>{playerStats.totalTime === 0 ? '-' : formatElapsed(playerStats.totalTime)}</div>
                    <div className="mt-4">Maximum Thinking</div>
                    <div>{playerStats.maxTime === 0 ? '-' : formatElapsed(playerStats.maxTime)}</div>
                    <div className="mt-4">Code Return Value</div>
                    <div>{playerStats.returnValue ?? '-'}</div>
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
