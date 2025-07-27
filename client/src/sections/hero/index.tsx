//
// Hero page section.
//

import StartButton from "@/components/home/StartButton";
import CasheBlockHome from '@/components/home/CacheBlockHome';

export default function Hero () {
    return (
        <section id="hero" className="min-h-screen flex flex-col items-center justify-start bg-rvc-primary-white hero-gradient-bg">
            <div className="h-15"></div>
            <h1 className="text-rvc-primary-green">Welcome to the Game!</h1>
            <p>Click the button below to start a new game.</p>
            <StartButton />
            <CasheBlockHome />
        </section>
    );
}


