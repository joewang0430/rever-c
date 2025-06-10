"use client";

import { useEffect, useState } from "react";

export default function TestPage() {

  const [cResult, setCResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/test")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Network response was not ok. Http status: ${res.status}`);
        }
        return res.json()})
      .then((data) => {
        setCResult(data.testLayer1_return);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
  }, []);

  return (
    <main className="flex flex-col">
      <h1>Return value</h1>
      {cResult === null ? (
        <p>Loading...</p>
        ) : (
        <p>the return value is: {cResult}</p>)
      }
    </main>
  );
}


// ==================== Test Page ====================

// export default function TestPage() {
//   return (
//     <main className="flex flex-col">
//       <h1>Welcome to the Next.js App!</h1>
//       <p>This is a simple page.</p>
//       <p>Feel free to explore and modify the code!</p>
//     </main>
//   );
// }