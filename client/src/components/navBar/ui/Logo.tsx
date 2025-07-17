import Image from "next/image";

interface LogoProps {
    mobile: boolean;
    url: string;
}

const Logo = ({mobile, url}: LogoProps) => {
    return (
        <>
            <Image src="/rvc_logo.svg" alt="Logo" width={164} height={164} />
        </>
    );
};

export default Logo;