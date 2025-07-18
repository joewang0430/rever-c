"use client";

import { useState, useRef } from "react";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { 
    NavigationMenuItem
} from "@/components/ui/navigation-menu";

interface JoinUsProps {
    mobile: boolean;
    url: string;
};

// Where we are now, based on it, decide whether to jump in same tab
const sameTabUrls = ["/questions", "/contact", "/"]; 

const JoinUs = ({mobile, url}: JoinUsProps) => {
    const contactUrl = "/contact";
    const githubUrl = "https://github.com/joewang0430/rever-c";
    const isSameTab = sameTabUrls.includes(url);

    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);

    // Click the external to close drop-down
    function handleBlur(e: React.FocusEvent<HTMLButtonElement>) {
        setTimeout(() => {
            if (!btnRef.current?.contains(document.activeElement)) {
                setOpen(false);
            }
        }, 100);
    }

    if (mobile) {
        return isSameTab ? (
            <Link
                href={contactUrl}
                className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
            >
                Join Us
            </Link>
        ) : (
            <Link
                href={contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
            >
                Join Us
            </Link>
        );
    }
    return (
        <NavigationMenuItem className="relative">
            <button
                ref={btnRef}
                onClick={() => setOpen((v) => !v)}
                onBlur={handleBlur}
                tabIndex={0}
                className="hover:text-rvc-primary-green rvct-theme-500"
            >
                Join Us
            </button>
            {open && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white shadow-lg rounded flex flex-col z-50">
                    <Link
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 hover:bg-rvc-primary-green hover:text-rvc-primary-white transition text-center w-full flex items-center justify-center gap-2"
                        >
                        <FaGithub className="w-5 h-5" />
                        <div className="rvct-theme">GitHub</div>
                    </Link>
                    {isSameTab ? (
                        <Link
                            href={contactUrl}
                            className="px-4 py-2 hover:bg-rvc-primary-green hover:text-rvc-primary-white transition text-center hover:text-rvc-primary-green rvct-theme"
                        >
                            Contact Us
                        </Link>
                    ) : (
                        <Link
                            href={contactUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 hover:bg-rvc-primary-green hover:text-rvc-primary-white transition text-center hover:text-rvc-primary-green rvct-theme"
                        >
                            Contact Us
                        </Link>
                    )}
                    
                </div>
            )}
        </NavigationMenuItem>
    );
};

export default JoinUs;