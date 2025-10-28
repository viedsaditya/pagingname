"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getPagings } from "../utils/api";

import ClientOnly from "../components/ClientOnly";
import TextType from "../components/TextType";

function PagingScreenContent() {
  const searchParams = useSearchParams();
  const beltNo = useMemo(() => searchParams.get("belt_no"), [searchParams]);

  const [sqCode, setSqCode] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [handleBy, setHandleBy] = useState("Jas");
  const [currentDate, setCurrentDate] = useState("Loading...");
  const [isClient, setIsClient] = useState(false);

  // Index for which language to show
  const [index, setIndex] = useState(0);

  // Define types for API response
  interface PagingItem {
    belt_no: string | number;
    flight_no?: string;
    name_passenger?: string;
    handle_by?: string;
    free_text?: string;
    status?: number;
    [key: string]: unknown;
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
      setFreeText(filtered[0].free_text || "");
      setHandleBy(filtered[0].handle_by || "Jas");
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
        setHandleBy(anyBeltData[0].handle_by || "Jas");
      } else {
        setFreeText("");
        setHandleBy("Jas");
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

  // Language switch animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % 2);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Header titles that will animate/change
  const headerTexts = useMemo(
    () => [
      {
        id: 1,
        title: "ATTENTION",
        description: (
          <>
            <span className="whitespace-nowrap flex justify-center items-center">
              The Following Passenger(s) of &thinsp;<strong>{sqCode}</strong>
              &thinsp; / {isClient ? currentDate : ""} :
            </span>
          </>
        ),
      },
      {
        id: 2,
        title: "PERHATIAN",
        description: (
          <>
            <span className="whitespace-nowrap flex justify-center items-center">
              Penumpang Berikut Dari &thinsp;<strong>{sqCode}</strong>&thinsp; /{" "}
              {isClient ? currentDate : ""} :
            </span>
          </>
        ),
      },
    ],
    [sqCode, isClient, currentDate]
  );

  return (
    <div
      className="relative h-screen w-screen flex flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(rgba(147, 197, 253, 0.7), rgba(147, 197, 253, 0.7)), url(/airport_building.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 via-blue-500/20 to-blue-100/30"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Belt Number */}
        <div className="flex justify-between items-start p-8 relative">
          {/* Belt Number - Left */}
          <div className="flex items-start space-x-8">
            <div className="text-white">
              <div className="text-6xl font-bold">Belt</div>
              <div className="text-6xl font-bold">No.</div>
            </div>
            <div className="text-9xl font-bold text-white flex items-center">
              {beltNo || "1"}
            </div>
          </div>

          {/* Right - Airport Building Graphic */}
          <div
            className="absolute top-0 right-0"
            style={{ height: "calc(100% - 6px)" }}
          >
            <div className="relative h-full">
              {/* Airport Building Silhouette */}
              <div
                className="w-80 h-full opacity-60"
                style={{
                  background:
                    "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)",
                  clipPath: "polygon(0% 100%, 30% 0%, 100% 0%, 100% 100%)",
                }}
              ></div>

              {/* JAS Logo in center of triangle area */}
              <div className="absolute top-1/3 right-10">
                <Image
                  src="/Logo_JAS.png"
                  alt="JAS Airways Logo"
                  width={180}
                  height={90}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-full border-t-2 border-white/30 -mt-2"></div>

        {/* Enhanced Content Area */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-8 py-8 mb-20">
          {/* Header Section */}
          <div className="w-full max-w-5xl text-center mb-8">
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
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg">
                      {headerTexts[index].title}
                    </h1>
                    <p
                      className="text-3xl md:text-5xl text-white mb-1 mt-2"
                      suppressHydrationWarning
                    >
                      {headerTexts[index].description}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </ClientOnly>
          </div>

          {/* Content Area - Perfectly centered in remaining space */}
          <div className="flex-1 flex items-center justify-center w-full">
            {/* Content Section - Centered in available space */}
            <div className="relative w-full max-w-7xl flex justify-center">
              {/* Subtle content frame */}
              <div className="absolute -inset-1 bg-gradient-to-br from-white/10 via-blue-300/5 to-white/10 rounded-xl blur-md"></div>

              {/* Main content container - Always present with fixed background and perfect centering */}
              <div
                className="relative p-10 rounded-xl bg-black/10 backdrop-blur-sm border border-white/20 w-full mx-auto flex items-center justify-center"
                style={{ minHeight: "450px" }}
              >
                {/* Dynamic passenger names grid - responsive layout that centers based on number of names */}
                {names.length > 0 ? (
                  <div
                    className={`grid gap-x-8 gap-y-6 px-6 place-items-center w-full ${
                      names.length === 1
                        ? "grid-cols-1"
                        : names.length === 2
                        ? "grid-cols-2"
                        : names.length === 3
                        ? "grid-cols-3"
                        : names.length <= 4
                        ? "grid-cols-2"
                        : names.length <= 6
                        ? "grid-cols-3"
                        : names.length <= 8
                        ? "grid-cols-4"
                        : "grid-cols-4"
                    }`}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
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
                              ? "text-5xl md:text-6xl"
                              : names.length === 2
                              ? "text-5xl md:text-7xl"
                              : names.length === 3
                              ? "text-4xl md:text-6xl"
                              : "text-3xl md:text-5xl"
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
                  <div className="flex flex-col items-center justify-center w-full h-full text-white text-center">
                    {freeText ? (
                      <TextType
                        text={freeText}
                        typingSpeed={120}
                        pauseDuration={3000}
                        deletingSpeed={60}
                        showCursor={true}
                        cursorCharacter="|"
                        loop={true}
                        noDelete={true}
                        className="text-6xl font-bold text-white whitespace-pre-line"
                      />
                    ) : (
                      <TextType
                        text={[
                          "PLEASE BE CAREFUL WHILE COLLECTING THE BAG AND DO NOT TAKE THE WRONG BAGGAGE",
                          "OUT OF GAUGE (OOG) OR OVERSIZED BAGGAGE IS LOCATED NEAR CONVEYOR BELT NO.6",
                        ]}
                        typingSpeed={100}
                        pauseDuration={3000}
                        deletingSpeed={50}
                        showCursor={true}
                        cursorCharacter="|"
                        loop={true}
                        noDelete={true}
                        className="text-6xl font-bold"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-white/30 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-white/30 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-white/30 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-white/30 rounded-br-xl"></div>
            </div>
          </div>
        </div>

        {/* Running Text Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-50 py-4 overflow-hidden bg-blue-200/80 backdrop-blur-sm border-t border-white/30">
          <div className="relative w-full h-12 flex items-center overflow-hidden">
            <div className="whitespace-nowrap flex items-center animate-marquee">
              {/* English Message */}
              <span className="text-2xl md:text-3xl text-blue-900 font-bold whitespace-nowrap mr-16">
                PLEASE REPORT TO {handleBy?.toUpperCase() || "JAS"} BAGGAGE
                SERVICES COUNTER{" "}
                {beltNo
                  ? `IN FRONT OF BELT 1`
                  : "AT ARRIVAL HALL INFORMATION COUNTER"}{" "}
                OR APPROACH OUR GROUND STAFF FOR ASSISTANCE
              </span>
              {/* Separator */}
              <span className="text-blue-700 text-3xl mr-16">|</span>
              {/* Indonesian Message */}
              <span className="text-2xl md:text-3xl text-blue-900 font-bold whitespace-nowrap mr-16">
                HARAP MELAPOR KE KONTER LAYANAN BAGASI{" "}
                {handleBy?.toUpperCase() || "JAS"}{" "}
                {beltNo
                  ? `DI DEPAN BELT 1`
                  : "DI KONTER INFORMASI HALL KEDATANGAN"}{" "}
                ATAU HUBUNGI STAF DARAT KAMI UNTUK BANTUAN
              </span>
              {/* Separator */}
              <span className="text-blue-700 text-3xl mr-16">|</span>
              {/* Repeat the messages for seamless marquee */}
              <span className="text-2xl md:text-3xl text-blue-900 font-bold whitespace-nowrap mr-16">
                PLEASE REPORT TO {handleBy?.toUpperCase() || "JAS"} BAGGAGE
                SERVICES COUNTER{" "}
                {beltNo
                  ? `IN FRONT OF BELT 1`
                  : "AT ARRIVAL HALL INFORMATION COUNTER"}{" "}
                OR APPROACH OUR GROUND STAFF FOR ASSISTANCE
              </span>
              <span className="text-blue-700 text-3xl mr-16">|</span>
              <span className="text-2xl md:text-3xl text-blue-900 font-bold whitespace-nowrap mr-16">
                HARAP MELAPOR KE KONTER LAYANAN BAGASI{" "}
                {handleBy?.toUpperCase() || "JAS"}{" "}
                {beltNo
                  ? `DI DEPAN BELT 1`
                  : "DI KONTER INFORMASI HALL KEDATANGAN"}{" "}
                ATAU HUBUNGI STAF DARAT KAMI UNTUK BANTUAN
              </span>
              <span className="text-blue-700 text-3xl mr-16">|</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagingScreen() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-100 flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <PagingScreenContent />
    </Suspense>
  );
}
