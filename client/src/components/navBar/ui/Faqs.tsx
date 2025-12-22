import { NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import Link from "next/link";

interface FaqsProps {
    mobile: boolean;
    url: string;
};

const diffTabUrls = ["/setup", "/game"]; 

const Faqs = ({mobile, url}: FaqsProps) => {
    const faqUrl = "/questions";
    const diffTab = diffTabUrls.some(path => url.startsWith(path));

    if (mobile) {
        return diffTab ? (
            <Link
                href={faqUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
            >
                FAQs
            </Link>
        ) : (
            <Link
                href={faqUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 hover:text-rvc-primary-green rvct-theme-500 transition"
            >
                FAQs
            </Link>
        );
    }
    return (
        <NavigationMenuItem>
            {/* <NavigationMenuLink asChild> */}
                {diffTab ? (
                    <Link
                        href={faqUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-rvc-primary-green rvct-theme-500 transition cursor-pointer"
                    >
                        FAQs
                    </Link>
                ) : (
                    <Link
                        href={faqUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-rvc-primary-green rvct-theme-500 transition cursor-pointer"
                    >
                        FAQs
                    </Link>
                )}
            {/* </NavigationMenuLink> */}
        </NavigationMenuItem>
    );
};

export default Faqs;