"use client";

import { useState, useEffect } from "react";
import { getStats } from "@/api/statsApi";
import Image from "next/image";

export default function Footer() {
    const [totalGames, setTotalGames] = useState<number | null>(null);

    useEffect(() => {
        getStats()
            .then(data => setTotalGames(data.total_games))
            .catch(err => console.error("Failed to fetch stats:", err));
    }, []);

    return (
        <footer className="bg-[#1a1a1a] text-white py-12 px-8">
            {/* Top Section: Three Columns */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-8 mb-10">
                {/* Left: ReverC Logo - Hidden on mobile */}
                <div className="hidden md:flex justify-start">
                    <Image
                        src="/svgs/footer/reverc_logo_footer.svg"
                        alt="ReverC Logo"
                        width={200}
                        height={80}
                        className="h-auto"
                    />
                </div>

                {/* Center: Games Played */}
                <div className="flex flex-col items-center">
                    <span className="text-gray-400 text-sm uppercase tracking-wider mb-1">
                        Total Games Played
                    </span>
                    <span className="text-4xl font-bold text-white">
                        {totalGames !== null ? totalGames.toLocaleString() : "—"}
                    </span>
                </div>

                {/* Right: WZD Logo Placeholder - Hidden on mobile */}
                <div className="hidden md:flex justify-end">
                    <Image
                        src="/svgs/footer/wzd_logo_placeholder.svg"
                        alt="WZD Logo"
                        width={200}
                        height={80}
                        className="h-auto"
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="max-w-6xl mx-auto border-t border-gray-700 pt-8">
                {/* Statement */}
                <p className="text-gray-400 text-sm text-center mb-3">
                    This is an unofficial fan-made project and is not affiliated with or endorsed by any official entity.
                </p>

                {/* Contact */}
                <p className="text-gray-400 text-sm text-center mb-3">
                    Contact developer{" "}
                    <a
                        href="mailto:icedeverjoe@outlook.com"
                        className="text-white underline hover:text-gray-300 transition-colors"
                    >
                        Joe Wang
                    </a>{" "}
                    for any concerns.
                </p>

                {/* Sister Project */}
                <p className="text-gray-400 text-sm text-center mb-8">
                    Welcome to see a sister project:{" "}
                    <a
                        href="https://chess.wangjue.me"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white underline hover:text-gray-300 transition-colors"
                    >
                        A chess analysis platform based on Stockfish engine →
                    </a>
                </p>

                {/* Copyright Row */}
                <div className="flex items-center justify-center gap-4">
                    <span className="text-gray-500 text-sm">
                        © 2026 ReverC. All rights reserved.
                    </span>

                    {/* GitHub Icon */}
                    <a
                        href="https://github.com/joewang0430/rever-c"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="GitHub"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                        </svg>
                    </a>

                    {/* Email Icon */}
                    <a
                        href="mailto:icedeverjoe@outlook.com"
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Email"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}