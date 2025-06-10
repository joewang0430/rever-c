// src/app/setup/[matchId]/page.tsx

interface PageProps {
  params: { matchId: string }
}

// This is a Server Component: no "use client" at top,
// no client-side hooks or imports
export default async function SetupPage({ params }: PageProps) {
    const { matchId } = await params;
    return (
        <main className="flex flex-col p-4">
            <h1>Setup Page</h1>
            <p>Match ID: {matchId}</p>
            <p>This is the setup page for match {matchId}</p>
        </main>
    )
}
