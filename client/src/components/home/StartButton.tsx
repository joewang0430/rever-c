"use client"

import { useRouter } from "next/navigation"
import { v4 as uuid } from "uuid"

const StartButton = () => {
  const router = useRouter()
  const start = () => {
    const matchId = uuid()           // generate uni matchId for each game
    router.push(`/setup/${matchId}`) // navigate to the setup page with the matchId
  }
  return <button onClick={start} className="hover:underline font-bold">Start a Game</button>
}

export default StartButton