// src/app/page.tsx
"use client"
import { useRouter } from "next/navigation"
import { v4 as uuid } from "uuid"

export default function HomePage() {
  const router = useRouter()
  const start = () => {
    const matchId = uuid()           // generate uni matchId for each game
    router.push(`/setup/${matchId}`) // navigate to the setup page with the matchId
    console.log("Navigating to setup page with matchId:", matchId) // TODO: remove this in production
  }
  return <button onClick={start}>Start a Game</button>
}