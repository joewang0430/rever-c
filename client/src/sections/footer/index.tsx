"use client";

import { useState, useEffect } from "react";
import { getStats } from "@/api/statsApi";

export default function Footer () {
    const [totalGames, setTotalGames] = useState<number | null>(null);

    useEffect(() => {
        getStats()
            .then(data => setTotalGames(data.total_games))
            .catch(err => console.error("Failed to fetch stats:", err));
    }, []);

    return (
        <section id="footer" className="bg-gray-100 h-128">
            <div className="text-white">
                Footer    
            </div>
            <div>
                Total Games Played: {totalGames !== null ? totalGames : "Loading..."}
            </div>
        </section>
    );
}