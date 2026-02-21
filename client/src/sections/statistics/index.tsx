"use client";

import { useState, useEffect } from "react";
import { getStats } from "@/api/statsApi";

export default function Statistics () {
    const [totalGames, setTotalGames] = useState<number | null>(null);

    useEffect(() => {
        getStats()
            .then(data => setTotalGames(data.total_games))
            .catch(err => console.error("Failed to fetch stats:", err));
    }, []);

    return (
        <section id="statictics" className="bg-rvc-primary-white h-128 ">
            <div>
                Total Games Played: {totalGames !== null ? totalGames : "Loading..."}
            </div>
        </section>
    );
}