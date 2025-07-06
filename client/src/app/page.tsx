// Home Page

"use client";

import { useState } from "react";
import StartButton from "@/components/home/StartButton";
import CasheBlockHome from '@/components/home/CacheBlockHome';

export default function HomePage() {

  { /* test */ }
  const [tip, setTip] = useState<string | null>(null);
  function showTip(msg: string, duration = 2000) {
    setTip(msg);
    setTimeout(() => setTip(null), duration);
  }

  return(
    <main>
      <h1>Welcome to the Game!</h1>
      <p>Click the button below to start a new game.</p>
      <StartButton />
      <CasheBlockHome />

      { /* test */ }
      <div>
        <button onClick={() => showTip("Operation Succeeded!")}>click on me to get tips</button>
        {tip && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow z-50 transition-all">
            {tip}
          </div>
        )}
      </div>
    </main>
  );
};