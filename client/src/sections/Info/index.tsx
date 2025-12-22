"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const CODE_FILENAME = "rvc_example.c";

const EXAMPLE_CODE = `#include <stdio.h>

// Return 1 if found a legal move and write to *row/*col, else return 0 (pass)
int makeMove(const char board[][26], int n, char turn, int *row, int *col) {
        char opp = (turn == 'B') ? 'W' : 'B';
        int dr[8] = {-1,-1,-1,0,0,1,1,1};
        int dc[8] = {-1,0,1,-1,1,-1,0,1};
        for (int r = 0; r < n; r++) {
                for (int c = 0; c < n; c++) {
                        if (board[r][c] != 'U') continue;
                        // check 8 directions
                        for (int k = 0; k < 8; k++) {
                                int rr = r + dr[k], cc = c + dc[k];
                                int foundOpp = 0;
                                while (rr >= 0 && rr < n && cc >= 0 && cc < n && board[rr][cc] == opp) {
                                        foundOpp = 1;
                                        rr += dr[k];
                                        cc += dc[k];
                                }
                                if (foundOpp && rr >= 0 && rr < n && cc >= 0 && cc < n && board[rr][cc] == turn) {
                                        *row = r; *col = c; return 1; // legal move
                                }
                        }
                }
        }
        return 0; // no legal move
}
`;

export default function Info() {
    const leftRef = useRef<HTMLDivElement>(null);
    const [leftHeight, setLeftHeight] = useState<number | null>(null);

    useEffect(() => {
        const update = () => {
            const isDesktop = window.innerWidth >= 768; // md breakpoint
            if (isDesktop && leftRef.current) {
                setLeftHeight(leftRef.current.offsetHeight);
            } else {
                setLeftHeight(null);
            }
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(EXAMPLE_CODE);
        } catch (e) {
            // noop
        }
    }, []);

    const handleDownload = useCallback(() => {
        const blob = new Blob([EXAMPLE_CODE], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = CODE_FILENAME;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }, []);

    return (
        <section id="info" className="bg-rvc-primary-green w-full py-14">
            <div className="mx-auto max-w-5xl px-8 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left: text content */}
                    <div className="text-white" ref={leftRef}>
                        <h2 className="font-bold text-3xl md:text-4xl leading-tight mb-4">What is ReverC?</h2>
                        <p className="text-white/90 mb-8">
                            ReverC is a lightweight browser platform where you use your own C function to play Reversi against humans, candidate code, historical algorithms, or AI.
                        </p>

                        <h3 className="font-bold text-2xl md:text-3xl leading-tight mb-4">Code Requirements?</h3>
                        <p className="text-white/90 mb-3">As a first-time attempt, you may ask:</p>
                        <ul className="list-disc pl-6 text-white/90 space-y-1 mb-4">
                            <li>Code format</li>
                            <li>Time limit</li>
                            <li>Other things I can do</li>
                            <li>The significance of this website</li>
                            <li>…</li>
                        </ul>
                        <p className="text-white/90 mb-5">Relax, it’s simple! Have a quick look at:</p>
                        <Link
                            href="/questions"
                            className="inline-flex items-center gap-2 bg-white text-rvc-primary-green px-5 py-3 rounded-lg shadow-sm hover:bg-white/95 transition"
                        >
                            Instructions (FAQs)
                            <span aria-hidden>→</span>
                        </Link>
                    </div>

                    {/* Right: code preview card */}
                    <div className="w-full" style={{ height: leftHeight ?? undefined }}>
                        <div className="bg-white rounded-xl shadow p-0 overflow-hidden h-full flex flex-col">
                            {/* Header bar */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 text-gray-600">
                                <span>{CODE_FILENAME}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCopy} className="px-2 py-1 rounded hover:bg-gray-100" aria-label="Copy code">Copy</button>
                                    <button onClick={handleDownload} className="px-2 py-1 rounded hover:bg-gray-100" aria-label="Download code">Download</button>
                                </div>
                            </div>
                            {/* Code preview (beginning only) */}
                            <pre className="text-sm leading-6 text-rvc-text-black px-4 py-4 overflow-auto flex-1">
{EXAMPLE_CODE}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}