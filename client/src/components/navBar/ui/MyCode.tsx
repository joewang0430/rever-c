import { NavigationMenuItem } from "@/components/ui/navigation-menu";

interface MyCodeProps {
    mobile: boolean;
    url: string;
};

const MyCode = ({mobile, url}: MyCodeProps) => {
    if (mobile) {
        return (
            <button
                    className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
                >
                <>My Code</>
            </button>
        );
    }
    return (
        <NavigationMenuItem>
            <>My Code</>
        </NavigationMenuItem>
    );
    
};

export default MyCode;