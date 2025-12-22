//
// Logo Component.
//

"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RvcDialog from "@/components/dialog/RvcDialog";
import { useSetupDataContext } from "@/contexts/SetupDataContext";
import { clearCandidate } from "@/utils/gameLogistics";

interface LogoProps {
    mobile: boolean;
    url: string;
}

const Logo = ({mobile, url}: LogoProps) => {
    const [showDialog, setShowDialog] = useState(false);
    const router = useRouter();
    const { setupData } = useSetupDataContext();

    const scrollToHero = () => {
        const heroSection = document.getElementById("hero");
        if (heroSection) {
            heroSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleLogoClick = () => {
        if (url === "/") {
            scrollToHero();
        } else {
            setShowDialog(true);
        }
    };

    const handleConfirm = async () => {
        setShowDialog(false);
        router.push("/");
        if (setupData) {
            if (url === "/setup") {
                await clearCandidate(setupData);
            } else {
                await clearCandidate(setupData);
            }
        }
        setTimeout(scrollToHero, 500); 
    };

    return (
        <>
            <button onClick={handleLogoClick} className="cursor-pointer">
                <Image src="/rvc_logo.svg" alt="Logo" width={164} height={164} />
            </button>
            {showDialog && (
                <RvcDialog 
                    title="Back Home?" 
                    onConfirm={handleConfirm}
                    open={showDialog}
                    onOpenChange={setShowDialog}
                    confirm="Home Page"
                    cancel="cancel"
                >
                    You will quit this setup page.
                </RvcDialog>
            )}
        </>
    );
};

export default Logo;