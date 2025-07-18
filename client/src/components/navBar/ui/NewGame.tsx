//
// New Game option in nav bar.
//

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import RvcDialog from "@/components/dialog/RvcDialog";

interface NewGameProps {
    mobile: boolean;
    url: string;
};

const hideUrls = ["/setup"];
const confirmUrls = ["/game"];

const NewGame = ({mobile, url}: NewGameProps) => {
    const isHidden = hideUrls.includes(url);
    const needConfirm = confirmUrls.some(path => url.startsWith(path));
    const [showDialog, setShowDialog] = useState(false);
    const router = useRouter();
    const newGameMsg = "You will lose the current process, and start a new one.";

    const handleNewGameClick = () => {
        if (needConfirm) {
            setShowDialog(true);
        } else {
            setShowDialog(false);
            router.push("/setup");
        }
    };

    const handleConfirm = () => {
        setShowDialog(false);
        router.push("/setup");
    };

    if (isHidden) return (<></>);

    if (mobile) {
        return (
            <>
            <button
                onClick={handleNewGameClick}
                className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
            >
                New Game
            </button>
            {showDialog && (
                <RvcDialog 
                    title="Start a New Game?" 
                    onConfirm={handleConfirm}
                    open={showDialog}
                    onOpenChange={setShowDialog}
                    confirm="New Game"
                    cancel="Cancel"
                >
                    {newGameMsg}
                </RvcDialog>
            )}
            </>
        );
    }
    return (
        <>
        <NavigationMenuItem>
            <button
                onClick={handleNewGameClick}
                className="hover:text-rvc-primary-green rvct-theme-500 transition cursor-pointer"
            >
                New Game
            </button>
        </NavigationMenuItem>
        {showDialog && (
            <RvcDialog 
                title="Start a New Game?" 
                onConfirm={handleConfirm}
                open={showDialog}
                onOpenChange={setShowDialog}
                confirm="New Game"
                cancel="Cancel"
            >
                {newGameMsg}
            </RvcDialog>
        )}
        </>
    );
};

export default NewGame;