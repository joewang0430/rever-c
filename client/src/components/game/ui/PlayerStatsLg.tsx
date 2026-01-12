"use client";
import { PlayerStats } from "@/data/types/game";
import { formatElapsed } from "@/utils/nameConverters";
import StatItem from "./StatItem";
import { useEffect, useRef, useState } from "react";

interface PlayerStatsLgProps {
    playerStats: PlayerStats;
    isCode: boolean;
    isAI?: boolean;
    aiName?: string;
}

const PlayerStatsLg = ({ playerStats, isCode, isAI = false, aiName }: PlayerStatsLgProps) => {
    const listRef = useRef<HTMLDivElement>(null);
    const prevLenRef = useRef<number>(playerStats.explanations?.length ?? 0);
    const [highlightIdx, setHighlightIdx] = useState<number | null>(null);

    useEffect(() => {
        const len = playerStats.explanations?.length ?? 0;
        if (len > prevLenRef.current) {
            setHighlightIdx(len - 1);
        }
        prevLenRef.current = len;
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [playerStats.explanations?.length]);
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
                    <div className="mt-4 w-full text-center">{(aiName || "LLM") + ":"}</div>
                    <div ref={listRef} className="w-full h-64 overflow-y-auto bg-gray-100 rounded-md border border-gray-200 p-2">
                        {(playerStats.explanations || []).map((item, idx) => {
                            const colLetter = String.fromCharCode(97 + (item.move?.col ?? 0));
                            const rowNumber = (item.move?.row ?? 0) + 1;
                            const notation = `[${colLetter}${rowNumber}]`;
                            const isHighlight = idx === highlightIdx;
                            return (
                                <div key={idx} className={`py-2 text-left rounded-md ${isHighlight ? "animate-new-item" : ""}`}>
                                    <div className="text-gray-700 font-bold text-rvc-primary-blue">{notation}</div>
                                    <div className="text-gray-800 rvct-theme-500">{item.text}</div>
                                </div>
                            );
                        })}
                        {/* {(playerStats.explanations ?? []).length === 0 && (
                            <div className="text-gray-400 text-center py-2">No AI explanations yet</div>
                        )} */}
                    </div>
                </>
            )}
        </div>
    );
};

export default PlayerStatsLg;
