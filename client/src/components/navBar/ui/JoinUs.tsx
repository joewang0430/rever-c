import { NavigationMenuItem } from "@/components/ui/navigation-menu";

interface JoinUsProps {
    mobile: boolean;
    url: string;
};

const JoinUs = ({mobile, url}: JoinUsProps) => {
    return (
        <NavigationMenuItem>
            <>Join Us</>
        </NavigationMenuItem>
    );
};

export default JoinUs;