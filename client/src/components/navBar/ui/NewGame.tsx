import { NavigationMenuItem } from "@/components/ui/navigation-menu";

interface NewGameProps {
    mobile: boolean;
    url: string;
};

const NewGame = ({mobile, url}: NewGameProps) => {
    return (
        <NavigationMenuItem>
            <>New Game</>
        </NavigationMenuItem>
        
    );
};

export default NewGame;