//
// The nav bar component of ReverC front-end page.
//

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import NavBarLarge from "./dynamic/NavBarLarge";
import NavBarSmall from "./dynamic/NavBarSmall";

const MOBILE_BREAKPOINT = 768; // Tailwind md: 768px

const NavBar = () => {
    const [show, setShow] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const lastScroll = useRef(0);
    const pathname = usePathname();

    // Listen the user scrolling operation, decede whether show nav
    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;
            if (current <= 0) {
                setShow(true);
            } else if (current > lastScroll.current) {
                setShow(false);
            } else {
                setShow(true);
            }
            lastScroll.current = current;
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Listen the screen width, decide which nav bar to use
    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);
    
    return (
        <nav
            className={clsx(
                "fixed top-0 left-0 w-full z-50 transition-transform duration-300 bg-rvc-primary-white min-h-12 border-b shadow",
                show ? "translate-y-0" : "-translate-y-full"
            )}
        >
            {isMobile 
            ? <NavBarSmall url={pathname}/> 
            : <NavBarLarge url={pathname}/>
            }
        </nav>
    );
};

export default NavBar;
