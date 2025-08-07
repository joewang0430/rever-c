import Image from 'next/image';

const SetupTitle = () => {
    return (
        <div className="flex justify-center items-center gap-5">
            {/* Left Side: First Move */}
            <Image
                src="/svgs/setup/setup_black.svg"
                alt="First Move"
                width={112} 
                height={39}
            />

            {/* Separator */}
            <span className="text-2xl text-gray-500 rvct-theme-500">
                VS
            </span>

            {/* Right Side: Move After */}
            <Image
                src="/svgs/setup/setup_white.svg"
                alt="Move After"
                width={112}
                height={39}
            />
        </div>
    );
};

export default SetupTitle;