//
// Button navigates from home page to the setup page.
//

"use client"

import { useRouter } from "next/navigation"

const StartButton = () => {
  const router = useRouter()
  const start = () => {
    router.push(`/setup`)
  }
  return <button onClick={start} className="hover:underline font-bold">Start a Game</button>
}

export default StartButton