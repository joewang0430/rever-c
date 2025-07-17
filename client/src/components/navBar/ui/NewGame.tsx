import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface NewGameProps {
    mobile: boolean;
    url: string;
};

const NewGame = ({mobile, url}: NewGameProps) => {
    if (mobile) {
        return (
            <button
                className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
            >
            <>New Game</>
        </button>
        );
    }
    return (
        <NavigationMenuItem>
            <>New Game</>
        </NavigationMenuItem>
    );
};

export default NewGame;