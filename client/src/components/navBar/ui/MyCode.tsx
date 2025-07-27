import { NavigationMenuItem } from "@/components/ui/navigation-menu";

interface MyCodeProps {
    mobile: boolean;
    url: string;
    onClose?: () => void; 
};

const hideUrls = ["/setup", "/game"];

const MyCode = ({mobile, url, onClose}: MyCodeProps) => {
    const isHidden = hideUrls.some(path => url.startsWith(path));

    const handleMyCodeClick = () => {
    const myCodeSection = document.getElementById("myCode");
    if (myCodeSection) {
        myCodeSection.scrollIntoView({ behavior: "smooth" });
    }
    if (mobile && onClose) {
        onClose(); // close the side bar
    }
};

    if (isHidden) return (<></>);

    if (mobile) {
        return (
            <button
                onClick={handleMyCodeClick}
                className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
            >
                <>My Code</>
            </button>
        );
    }
    return (
        <NavigationMenuItem>
            <button 
                onClick={handleMyCodeClick}
                className="hover:text-rvc-primary-green rvct-theme-500 transition cursor-pointer"
            >
                My Code
            </button>
        </NavigationMenuItem>
    );
    
};

export default MyCode;