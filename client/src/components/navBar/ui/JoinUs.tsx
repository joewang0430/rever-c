"use client";

import { useState, useRef } from "react";
import { FaGithub } from "react-icons/fa";
import { 
    NavigationMenuItem
} from "@/components/ui/navigation-menu";

interface JoinUsProps {
    mobile: boolean;
    url: string;
};

const JoinUs = ({mobile, url}: JoinUsProps) => {
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
        return (
            <button
                    className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
                >
                <>Join Us</>
            </button>
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
                    <a
                        href="https://github.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-rvc-text-black hover:bg-rvc-primary-green hover:text-rvc-primary-white transition text-center w-full flex items-center justify-center gap-2"
                        >
                        <FaGithub className="w-5 h-5" />
                        GitHub
                    </a>
                    <a
                        href="mailto:contact@yourdomain.com"
                        className="px-4 py-2 text-rvc-text-black hover:bg-rvc-primary-green hover:text-rvc-primary-white transition text-center hover:text-rvc-primary-green rvct-theme"
                    >
                        Contact Us
                    </a>
                </div>
            )}
        </NavigationMenuItem>
    );
};

export default JoinUs;