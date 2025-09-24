"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import PagingScreen from "./display/page";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by checking for the cookie
    const isLoggedIn = document.cookie.includes('logged_in=');
    
    if (!isLoggedIn) {
      // Redirect to login page if not authenticated
      router.push("/login");
    }
  }, [router]);

  // Check authentication on client side
  if (typeof window !== 'undefined') {
    const isLoggedIn = document.cookie.includes('logged_in=');
    if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Redirecting to login...</p>
          </div>
        </div>
      );
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <PagingScreen />
    </Suspense>
  );
}
