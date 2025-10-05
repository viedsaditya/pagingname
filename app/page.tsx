"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import PagingScreen from "./display/page";
import { isAuthenticated, setupSessionCheck } from "./utils/auth";

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Set client-side flag to avoid hydration mismatch
    setIsClient(true);
    
    // Check authentication only on client side
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    
    if (!authStatus) {
      // Redirect to login page if not authenticated or session expired
      router.replace("/login");
      return;
    }
    
    // Setup periodic session check (every 5 minutes)
    const sessionInterval = setupSessionCheck(router);
    
    // Cleanup interval on component unmount
    return () => {
      if (sessionInterval) {
        clearInterval(sessionInterval);
      }
    };
  }, [router]);

  // If not authenticated, show nothing while redirecting
  if (!isClient || !isAuth) {
    return null;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <PagingScreen />
    </Suspense>
  );
}
