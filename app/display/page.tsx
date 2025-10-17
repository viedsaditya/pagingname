"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getPagings } from "../utils/api";

import ClientOnly from "../components/ClientOnly";

function PagingScreenContent() {
  const searchParams = useSearchParams();
  const beltNo = useMemo(() => searchParams.get("belt_no"), [searchParams]);

  const [sqCode, setSqCode] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [freeText, setFreeText] = useState(""); // Added state for free_text
  const [handleBy, setHandleBy] = useState("Jas"); // Default to Jas
  const [currentTime, setCurrentTime] = useState("00:00");
  const [currentDate, setCurrentDate] = useState("Loading...");
  const [isClient, setIsClient] = useState(false);

  // Define types for API response
  interface PagingItem {
    belt_no: string | number;
    flight_no?: string;
    name_passenger?: string;
    handle_by?: string;
    free_text?: string;
    status?: number; // Adding status field explicitly
    [key: string]: unknown; // For other properties
  }

  // Helper fetcher with useCallback to prevent recreation on each render
  const fetchData = useCallback(async () => {
    if (!beltNo) return;
    const allPagings = await getPagings();

    // Filter by belt_no and status=1 (only show data with status 1)
    const filtered = (allPagings || []).filter(
      (p: PagingItem) => String(p.belt_no) === String(beltNo) && p.status === 1
    );

    if (Array.isArray(filtered) && filtered.length > 0) {
      setSqCode(filtered[0].flight_no || "");
      setFreeText(filtered[0].free_text || ""); // Store the free_text
      setHandleBy(filtered[0].handle_by || "Jas"); // Store the handle_by value
      const passengerNames = filtered
        .flatMap((item: PagingItem) =>
          String(item.name_passenger || "").split(",")
        )
        .map((n: string) => n.trim())
        .filter(Boolean);
      setNames(passengerNames);
    } else {
      // If we have beltNo but no filtered data (nothing with status 1),
      // try to get the free_text from any record with this belt_no
      const anyBeltData = (allPagings || []).filter(
        (p: PagingItem) => String(p.belt_no) === String(beltNo)
      );

      if (anyBeltData.length > 0) {
        setFreeText(anyBeltData[0].free_text || "");
        setHandleBy(anyBeltData[0].handle_by || "Jas"); // Store handle_by even for non-status-1 data
      } else {
        setFreeText("");
        setHandleBy("Jas"); // Default to Jas if no data
      }

      setSqCode("");
      setNames([]);
    }
  }, [beltNo]);

  // Fetch sekali ketika beltNo berubah
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set client-side flag and initialize time
  useEffect(() => {
    setIsClient(true);
    updateTimeAndDate();
    
    // Update time every second
    const interval = setInterval(updateTimeAndDate, 1000);
    return () => clearInterval(interval);
  }, []);

  // Function to update time and date
  const updateTimeAndDate = () => {
    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    setCurrentDate(
      now.toLocaleDateString("en-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  };

  // Polling untuk auto refresh ketika data berubah di server
  useEffect(() => {
    if (!beltNo) return;
    let isActive = true;
    const intervalId = setInterval(() => {
      if (!isActive) return;
      fetchData();
    }, 1000); // refresh tiap 1 detik
    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [beltNo, fetchData]);

  // Index for which language to show
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % 2);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Header titles that will animate/change
  const headerTexts = useMemo(() => [
    {
      id: 1,
      title: "ATTENTION",
      description: (
        <>
          <span className="whitespace-nowrap flex justify-center items-center">The Following Passenger(s) of &thinsp;<strong>{sqCode}</strong>&thinsp; / {isClient ? currentDate : ""} :</span>
        </>
      ),
      instruction: (
        <>
          <span className="whitespace-nowrap flex justify-center items-center">Please Exceed The {handleBy?.toUpperCase() || 'JAS'} Counter</span>
        </>
      ),
    },
    {
      id: 2,
      title: "PERHATIAN",
      description: (
        <>
          <span className="whitespace-nowrap flex justify-center items-center">Penumpang Berikut Dari &thinsp;<strong>{sqCode}</strong>&thinsp; / {isClient ? currentDate : ""} :</span>
        </>
      ),
      instruction: (
        <>
          <span className="whitespace-nowrap flex justify-center items-center">Silahkan Mendatangani {handleBy?.toUpperCase() || 'JAS'} Konter</span>
        </>
      ),
    },
  ], [sqCode, isClient, currentDate, handleBy]);

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden" suppressHydrationWarning>
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950"></div>

        {/* Enhanced gradient blobs */}
        <div className="absolute top-20 left-10 w-[35vw] h-[35vw] bg-gradient-to-r from-cyan-500/20 to-blue-500/10 rounded-full blur-3xl animate-move-slow"></div>
        <div className="absolute bottom-20 right-10 w-[40vw] h-[40vw] bg-gradient-to-r from-blue-600/15 to-cyan-400/10 rounded-full blur-3xl animate-move-reverse"></div>
        <div className="absolute top-1/3 right-1/4 w-[30vw] h-[30vw] bg-gradient-to-r from-indigo-500/10 to-blue-400/10 rounded-full blur-3xl animate-move-slow"></div>

        {/* Radial overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(15,23,42,0.7)_100%)]"></div>

        {/* Improved tech grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(56,189,248,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.3)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(15,23,42,0.4)_100%)]"></div>

        {/* Animated light streaks */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-60"></div>
      </div>

      {/* Clean and Minimal Header with standardized sizes */}
      <div className="relative z-20 px-8 py-8 border-b border-gray-700 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 backdrop-blur-md">
        <div className="grid grid-cols-3 items-center">
          {/* JAS or Gapura Logo based on handle_by value - Fixed width column */}
          <div className="flex items-center justify-start">
            <div className="bg-white/50 p-6 rounded-xl w-64 h-32 flex items-center justify-center">
              <Image
                src={
                  handleBy?.toLowerCase() === "gapura"
                    ? "/Logo_Gapura.png"
                    : "/Logo_JAS.png"
                }
                alt={`${handleBy} Logo`}
                width={300}
                height={150}
                className="max-h-28 max-w-56 object-contain"
              />
            </div>
          </div>

          {/* Current Time and Date - Always centered */}
          <div className="flex justify-center items-center text-white">
            <ClientOnly fallback={
              <div className="text-center">
                <div className="text-5xl font-semibold">00:00</div>
                <div className="text-2xl text-cyan-400">Loading... | CGK</div>
              </div>
            }>
              <div className="text-center">
                <div className="text-5xl font-semibold" suppressHydrationWarning>
                  {currentTime}
                </div>
                <div className="text-2xl text-cyan-400" suppressHydrationWarning>
                  {currentDate} | CGK
                </div>
              </div>
            </ClientOnly>
          </div>

          {/* Airline Logo or Icon - Fixed width column */}
          <div className="flex items-center justify-end">
            <div className="bg-white/50 p-6 rounded-xl w-64 h-32 flex items-center justify-center">
              {beltNo && sqCode ? (
                <Image
                  src={`/airlines/${sqCode?.substring(0, 2) || ""}.png`}
                  alt={`${sqCode?.substring(0, 2) || ""} Logo`}
                  width={300}
                  height={150}
                  className="max-h-24 max-w-52 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/airlines/EY.png";
                  }}
                />
              ) : (
                <Image
                  src="/Arrival.png"
                  alt="Arrival Icon"
                  width={300}
                  height={150}
                  className="max-h-28 max-w-56 object-contain"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="relative z-10 flex flex-col items-center flex-1 w-full p-8 pt-4 pb-0 space-y-0">
        {/* Header Section - Without Frame */}
        <div className="w-full max-w-5xl text-center mb-0">
          <ClientOnly>
            <AnimatePresence mode="wait">
              {beltNo && sqCode ? (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-5xl md:text-7xl font-extrabold text-cyan-300 drop-shadow-lg">
                    {headerTexts[index].title}
                  </h1>
                  <p className="text-3xl md:text-5xl text-gray-100 mb-1 mt-2" suppressHydrationWarning>
                    {headerTexts[index].description}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </ClientOnly>
        </div>

        {/* Passenger Names Section - With Frame */}
        <div className="relative w-full max-w-7xl flex justify-center mt-6">
          {/* Subtle content frame */}
          <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-slate-500/10 rounded-xl blur-md mt-6"></div>

          {/* Main content container - Only for passenger names - with wider frame */}
          <div
            className="relative p-10 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10 w-full mx-auto mt-6 flex items-center justify-center"
            style={{ minHeight: "500px" }}
          >
            {/* Dynamic passenger names grid - responsive layout that centers based on number of names */}
            {names.length > 0 ? (
              <div 
                className={`grid gap-x-8 gap-y-6 px-6 place-items-center ${
                  names.length === 1 
                    ? 'grid-cols-1' 
                    : names.length === 2 
                    ? 'grid-cols-2' 
                    : names.length === 3 
                    ? 'grid-cols-3' 
                    : names.length <= 4
                    ? 'grid-cols-2'
                    : names.length <= 6
                    ? 'grid-cols-3'
                    : names.length <= 8
                    ? 'grid-cols-4'
                    : 'grid-cols-4'
                }`}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {names.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center w-full"
                  >
                    <p
                      className={`font-bold text-white text-center break-words hyphens-auto ${
                        names.length === 1 
                          ? 'text-5xl md:text-6xl' 
                          : names.length === 2 
                          ? 'text-5xl md:text-7xl' 
                          : names.length === 3 
                          ? 'text-4xl md:text-6xl' 
                          : 'text-3xl md:text-5xl'
                      }`}
                      style={{
                        maxWidth: "100%",
                        lineHeight: "1.1",
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-white text-center min-h-[400px] my-auto mt-30">
                {freeText ? (
                  <p className="text-6xl font-bold text-white whitespace-pre-line">
                    {freeText}
                  </p>
                ) : (
                  <>
                    <p className="text-6xl font-bold mb-4">
                      PLEASE BE CAREFUL WHILE COLLECTING THE BAG AND DO NOT TAKE
                      THE WRONG BAGGAGE
                    </p>
                    <p className="text-5xl">
                      OUT OF GAUGE (OOG) OR OVERSIZED BAGGAGE IS LOCATED NEAR
                      CONVEYOR BELT NO.6
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Decorative corner elements - moved to follow the same margin as the frame */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyan-400/30 rounded-tl-xl mt-6"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyan-400/30 rounded-tr-xl mt-6"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-400/30 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-400/30 rounded-br-xl"></div>
        </div>

        {/* Instruction Text Below Box */}
        <div className="w-full max-w-5xl text-center mt-6">
          <ClientOnly>
            <AnimatePresence mode="wait">
              {beltNo && sqCode ? (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* <p className="text-3xl md:text-5xl text-gray-100 mb-1 mt-5" suppressHydrationWarning>
                    {headerTexts[index].instruction}
                  </p> */}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </ClientOnly>
        </div>
      </div>

      {/* Clean and Minimal Running Text Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 border-t border-gray-700 py-6 overflow-hidden">
        <div className="animate-marquee flex items-center">
         <marquee scrollamount="5">
          {/* English Message */}
          <span className="text-3xl md:text-4xl text-cyan-300 font-bold whitespace-nowrap mr-16">
            PLEASE REPORT TO PT JAS BAGGAGE SERVICES COUNTER{" "}
            {beltNo
              ? `IN FRONT OF BELT 1`
              : "AT ARRIVAL HALL INFORMATION COUNTER"}{" "}
            OR APPROACH OUR GROUND STAFF FOR ASSISTANCE
          </span>

          {/* Separator */}
          <span className="text-cyan-400 text-4xl mr-16">|</span>

          {/* Indonesian Message */}
          <span className="text-3xl md:text-4xl text-cyan-300 font-bold whitespace-nowrap mr-16">
            HARAP MELAPOR KE KONTER LAYANAN BAGASI PT JAS{" "}
            {beltNo
              ? `DI DEPAN BELT 1`
              : "DI KONTER INFORMASI HALL KEDATANGAN"}{" "}
            ATAU HUBUNGI STAF DARAT KAMI UNTUK BANTUAN
          </span>

          {/* Separator */}
          <span className="text-cyan-400 text-4xl mr-16">|</span>
        </marquee>
        </div>
      </div>
    </div>
  );
}

export default function PagingScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <PagingScreenContent />
    </Suspense>
  );
}
