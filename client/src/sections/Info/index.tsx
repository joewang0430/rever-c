"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const CODE_FILENAME = "rvc_example.c";

const EXAMPLE_CODE = `
/**
 * This sample code can be directly submitted to reverc.org to compete.
 *
 * The makeMove() signature was defined in lab8part2.h by the APS105 teaching team
 * at the University of Toronto (UofT) in 2022. This sample code and reverc.org are
 * provided by Jue Wang. The code is protected under the MIT License.
 *
 * APS105 students at UofT are responsible for academic integrity and should take
 * responsibility when referring to this code.
 */

#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>

/**
 * For APS105 students, you can safely keep these two including statement since ReverC stores them.
 */
#include "lab8part2.h"
#include "liblab8part2.h"

/**
 * You can also choose to include rvc.h, which is a library provided by ReverC (not teaching team).
 * It helps you quickly test your prototype. It can be recognized during the competition.
 */
#include "rvc.h"      

// By using rvc.h, your code will be linked with another file called "rvc_tools.c", 
// where four ready-made functions are defined for you to use, they are:

/*
static bool rvc_in_bounds(int n, int row, int col);     // Whether the position is in bound
static bool rvc_occupied(const char board[][26], int row, int col); // Whether the position is occupied
static bool rvc_position_legal_direction(const char board[][26], int n, int row, 
    int col, char color, int deltaRow, int deltaCol);   // Whether the position is legal in one direction
bool rvc_position_legal(const char board[][26], int n, int row, int col, char color);   // Whether the position is legal
*/

// Together, you can use those provided tool functions to write a random placed Reversi AI.
int makeMove(const char board[][26], int n, char turn, int *row, int *col) {
    int availableRows[26 * 26];
    int availableCols[26 * 26];
    int count = 0;

    // Traverse the board, find all possible moves
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (rvc_position_legal(board, n, r, c, turn)) {
                availableRows[count] = r;
                availableCols[count] = c;
                count++;
            }
        }
    }

    // In case no available moves (ReverC won't let it happen)
    if (count == 0) {
        return -1;
    }

    // Randomly choose one position to place
    int idx = rand() % count;
    *row = availableRows[idx];
    *col = availableCols[idx];
    return 0;
}

/**
 * In reverc.org, only a valid makeMove() function is required, so it's not mandatory to have main() function.
 */

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
                        <p className="text-white mb-8">
                            ReverC is a lightweight browser platform where you use your own C function to play Reversi against humans, candidate code, historical algorithms, or AI.
                        </p>

                        <h3 className="font-bold text-2xl md:text-3xl leading-tight mb-4">Code Requirements?</h3>
                        <p className="text-white mb-3">To upload your own code to compete, you should know:</p>
                        <ul className="list-disc pl-6 text-white space-y-1 mb-4">
                            <li>ReverC has built-in "lab8part2.h" and "liblab8part2.h", so codes with these two headers decleared won't cause error.</li>
                            <li>Ensure there's a MakeMove() function with correct format.</li>
                            <li>There is a time limit of 3 seconds for .c algorithm, exceeding it will end the game.</li>
                            {/* <li>…</li> */}
                        </ul>
                        <p className="text-white mb-5">Enjoy the game! See here for more details</p>
                        <Link
                            href="/questions"
                            className="rvct-theme-700 font-semibold inline-flex items-center gap-2 bg-white text-rvc-primary-black px-5 py-3 rounded-lg hover:bg-white/95 transition hover:underline"
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