//
// Nav bar in large screen mode, computer screen.
//

import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import Logo from "../ui/Logo";
import NewGame from "../ui/NewGame";
import MyCode from "../ui/MyCode";
import Faqs from "../ui/Faqs";
import JoinUs from "../ui/JoinUs";

interface NavBarLargeProps {
    url: string;
};

const NavBarLarge = ({url}: NavBarLargeProps) => {
    return (
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 h-full" style={{minHeight: "52px"}}>

            <Logo mobile={false} url={url}/>
            <NavigationMenu>
                <NavigationMenuList className="flex items-center gap-12">
                    <NewGame mobile={false} url={url} />
                    <MyCode mobile={false} url={url} />
                    <Faqs mobile={false} url={url} />
                    <JoinUs mobile={false} url={url} />
                </NavigationMenuList>
            </NavigationMenu>
                
        </div>
    );
};

export default NavBarLarge;