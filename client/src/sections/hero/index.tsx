"use client";

// Hero page section.

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSetupDataContext } from "@/contexts/SetupDataContext";
import RvcDialog from "@/components/dialog/RvcDialog";
import BoardPreview from "../../components/home/BoardPreview";

export default function Hero () {
    const router = useRouter();
    const pathname = usePathname();
    const { setupData } = useSetupDataContext();
    const [showDialog, setShowDialog] = useState(false);
    const isValid = true;

    // Navigation behavior aligned with NewGame: confirm on /game, otherwise go to /setup directly
    const handleStartGameClick = () => {
        const needConfirm = pathname?.startsWith("/game") ?? false;
        if (needConfirm) {
            setShowDialog(true);
        } else {
            router.push("/setup");
        }
    };

    const handleConfirm = async () => {
        setShowDialog(false);
        router.push("/setup");
        // If you want identical cleanup with NewGame, we can also call clearCandidate(setupData) here.
    };

    return (
        <section id="hero" className="min-h-screen w-full flex flex-col items-center justify-start bg-rvc-primary-white">
            {/* Top spacer to avoid overlapping with NavBar (slightly increased) */}
            <div className="h-24" />

            {/* Centerpiece: animated board preview */}
            <div className="w-full flex items-center justify-center py-8">
                <BoardPreview size={8} />
            </div>

            {/* Function tagline and signature */}
            <div className="px-6 text-center max-w-3xl">
                <p className="text-rvc-text-black/80 mb-3">Play reversi with your own .c function:</p>
                <p className="rvct-theme-700 text-xl md:text-2xl text-rvc-text-black">
                    int makeMove(const char board[][26], int n, char turn, int *row, int *col);
                </p>
            </div>

            {/* Start a Game button (UI aligned with requested style) */}
            <div className="mt-8">
                <button
                    className={`px-6 py-3 rounded-lg font-semibold text-white transition ${isValid ? "bg-rvc-primary-green hover:bg-rvc-primary-green/90" : "bg-gray-400 cursor-not-allowed"}`}
                    disabled={!isValid}
                    onClick={handleStartGameClick}
                    aria-label="Start a new game"
                >
                    Start a Game
                </button>
            </div>

            {/* What is ReverC? button (no navigation logic for now) */}
            <div className="mt-8">
                <button
                    className="rvct-theme underline text-rvc-primary-black hover:text-rvc-primary-green transition-colors"
                    aria-label="What is ReverC?"
                >
                    What is ReverC? / How to play ReverC?
                </button>
            </div>

            {/* Confirmation dialog when starting from /game */}
            {showDialog && (
                <RvcDialog 
                    title="Start a New Game?" 
                    onConfirm={handleConfirm}
                    open={showDialog}
                    onOpenChange={setShowDialog}
                    confirm="New Game"
                    cancel="Cancel"
                >
                    You will lose the current process, and start a new one.
                </RvcDialog>
            )}

        </section>
    );
}


