//
// Logo Component.
//

"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RvcDialog from "@/components/dialog/RvcDialog";

interface LogoProps {
    mobile: boolean;
    url: string;
}

const Logo = ({mobile, url}: LogoProps) => {
    const [showDialog, setShowDialog] = useState(false);
    const router = useRouter();

    const handleLogoClick = () => {
        if (url !== "/") {
            setShowDialog(true);
        } /* TODO: later add home page anchor */
    };

    const handleConfirm = () => {
        setShowDialog(false);
        router.push("/");
    };

    return (
        <>
            <button onClick={handleLogoClick}>
                <Image src="/rvc_logo.svg" alt="Logo" width={164} height={164} />
            </button>
            {showDialog && (
                <RvcDialog 
                    title="Back Home?" 
                    onConfirm={handleConfirm}
                    open={showDialog}
                    onOpenChange={setShowDialog}
                    confirm="Back Home"
                    cancel="cancel"
                >
                    Your current game settings will not be saved.
                </RvcDialog>
            )}
        </>
    );
};

export default Logo;