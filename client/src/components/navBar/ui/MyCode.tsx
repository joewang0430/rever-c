import { NavigationMenuItem } from "@/components/ui/navigation-menu";

interface MyCodeProps {
    mobile: boolean;
    url: string;
};

const MyCode = ({mobile, url}: MyCodeProps) => {
    return (
        <NavigationMenuItem>
            <>My Code</>
        </NavigationMenuItem>
    );
};

export default MyCode;