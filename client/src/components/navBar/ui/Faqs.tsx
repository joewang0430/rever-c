import { NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import Link from "next/link";

interface FaqsProps {
    mobile: boolean;
    url: string;
};

const sameTabUrls = ["/questions", "/contact", "/"]; 

const Faqs = ({mobile, url}: FaqsProps) => {
    const faqUrl = "/questions";
    const isSameTab = sameTabUrls.includes(url);

    if (mobile) {
        return isSameTab ? (
            <Link
                href={faqUrl}
                className="text-rvc-text-black block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
            >
                FAQs
            </Link>
        ) : (
            <Link
                href={faqUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rvc-text-black block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
            >
                FAQs
            </Link>
        );
    }
    return (
        
        <NavigationMenuItem>
            {/* <NavigationMenuLink asChild> */}
                {isSameTab ? (
                    <Link
                        href={faqUrl}
                        className="text-rvc-text-black hover:text-rvc-primary-green rvct-theme-500"
                    >
                        FAQs
                    </Link>
                ) : (
                    <Link
                        href={faqUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rvc-text-black hover:text-rvc-primary-green rvct-theme-500"
                    >
                        FAQs
                    </Link>
                )}
            {/* </NavigationMenuLink> */}
        </NavigationMenuItem>
    );
};

export default Faqs;