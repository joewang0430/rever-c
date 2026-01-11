//
// Nav bar in small screen mode, mobile phone.
//

// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Logo from "../ui/Logo";
import NewGame from "../ui/NewGame";
// import MyCode from "../ui/MyCode";
import Faqs from "../ui/Faqs";
import JoinUs from "../ui/JoinUs";

interface NavBarSmallProps {
    url: string;
};

const NavBarSmall = ({url}: NavBarSmallProps) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-full w-full" style={{ minHeight: "52px" }}>
            <Logo mobile={true} url={url} />
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <button aria-label="Open menu">
                        <Menu className="w-7 h-7" />
                    </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 max-w-full p-0">
                    <SheetTitle className="sr-only">Menu List</SheetTitle>
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-6 border-b">
                            <Logo mobile={true} url={url} />
                        </div>
                        <nav className="flex-1 flex flex-col gap-2 p-6">
                            <NewGame mobile={true} url={url} />
                           {/* <MyCode mobile={true} url={url} onClose={() => setOpen(false)} /> */}
                            <Faqs mobile={true} url={url} />
                            <JoinUs mobile={true} url={url} />
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>

            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button aria-label="Open menu">
                        <Menu className="w-7 h-7" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <NewGame mobile={false} url={url}/>
                </DropdownMenuContent>
            </DropdownMenu> */}
        </div>
    );
};

export default NavBarSmall;