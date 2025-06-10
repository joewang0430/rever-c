// Home Page

import StartButton from "@/components/home/StartButton";
import CasheBlockHome from '@/components/home/CacheBlockHome';

export default function HomePage() {
  return(
    <main>
      <h1>Welcome to the Game!</h1>
      <p>Click the button below to start a new game.</p>
      <StartButton />
      <CasheBlockHome />
    </main>
  );
}