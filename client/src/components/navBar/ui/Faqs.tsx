import { NavigationMenuItem } from "@/components/ui/navigation-menu";

interface FaqsProps {
    mobile: boolean;
    url: string;
};

const Faqs = ({mobile, url}: FaqsProps) => {
    if (mobile) {
        return (
            <button
                    className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
                >
                <>FAQs</>
            </button>
        );
    }
    return (
        <NavigationMenuItem>
            <>FAQs</>
        </NavigationMenuItem>
    );
};

export default Faqs;