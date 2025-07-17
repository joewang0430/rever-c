import { NavigationMenuItem } from "@/components/ui/navigation-menu";

interface FaqsProps {
    mobile: boolean;
    url: string;
};

const Faqs = ({mobile, url}: FaqsProps) => {
    return (
        <NavigationMenuItem>
            <>FAQs</>
        </NavigationMenuItem>
        
    );
};

export default Faqs;