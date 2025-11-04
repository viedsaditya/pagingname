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
  const [currentPage, setCurrentPage] = useState(0);
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

  // Decide handler logo (JAS vs GAPURA) based on handleBy from data
  const { handlerLogoSrc, isGapuraHandler } = useMemo(() => {
    const normalizedHandler = (handleBy || "").toLowerCase();
    const isGapura = normalizedHandler.includes("gapura");
    return {
      handlerLogoSrc: isGapura ? "/Logo_Gapura.png" : "/Logo_JAS.png",
      isGapuraHandler: isGapura,
    };
  }, [handleBy]);

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

  // Auto-change untuk passenger names (5 per halaman)
  useEffect(() => {
    // Reset currentPage saat names berubah
    setCurrentPage(0);
    
    // Jika kurang dari atau sama dengan 5, tidak perlu pagination
    if (names.length <= 5) {
      return;
    }

    // Hitung total halaman: setiap halaman 5 passenger
    const totalPages = Math.ceil(names.length / 5);
    
    // Pastikan ada lebih dari 1 halaman untuk pagination
    if (totalPages <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentPage((prev) => {
        // Maju ke halaman berikutnya, jika sudah di halaman terakhir, kembali ke 0
        const nextPage = (prev + 1) % totalPages;
        return nextPage;
      });
    }, 5000); // ganti halaman setiap 5 detik

    return () => clearInterval(intervalId);
  }, [names.length]);

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
            {/* <span className="whitespace-nowrap flex justify-center items-center">
              The Following Passenger(s) of &thinsp;<strong>{sqCode}</strong>
              &thinsp; / {isClient ? currentDate : ""} 
            </span> */}
            <span className="whitespace-nowrap flex justify-center items-center">
              The Following Passenger(s) of 
            </span>
          </>
        ),
      },
      {
        id: 2,
        title: "PERHATIAN",
        description: (
          <>
            {/* <span className="whitespace-nowrap flex justify-center items-center">
              Penumpang Berikut Dari &thinsp;<strong>{sqCode}</strong>&thinsp; /{" "}
              {isClient ? currentDate : ""} 
            </span> */}
            <span className="whitespace-nowrap flex justify-center items-center">
              Penumpang Berikut Dari 
            </span>
          </>
        ),
      },
    ],
    [sqCode, isClient, currentDate]
  );

  // Get current page passengers (maksimal 5 per halaman)
  const getCurrentPagePassengers = () => {
    if (names.length === 0) return [];
    
    // Jika total <= 5, tampilkan semua
    if (names.length <= 5) return names;
    
    // Hitung total halaman (setiap halaman 5 passenger)
    const totalPages = Math.ceil(names.length / 5);
    
    // Pastikan currentPage valid (0 sampai totalPages-1)
    const safeCurrentPage = Math.max(0, Math.min(currentPage, totalPages - 1));
    
    // Hitung index untuk slice: setiap halaman 5 passenger
    const startIndex = safeCurrentPage * 5;
    const endIndex = startIndex + 5; // Ambil 5 passenger per halaman
    
    // Ambil 5 passenger untuk halaman ini
    const result = names.slice(startIndex, endIndex);
    
    // Safety check: jika hasil kosong (seharusnya tidak terjadi), kembali ke halaman pertama
    if (result.length === 0 && names.length > 0) {
      return names.slice(0, 5);
    }
    
    return result;
  };

  

  return (
    <div
      className="relative h-screen w-screen flex flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(rgba(147, 197, 253, 0.7), rgba(147, 197, 253, 0.7))",
          // "linear-gradient(rgba(147, 197, 253, 0.7), rgba(147, 197, 253, 0.7)), url(/airport_building.png)",
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

          {/* Center - ATTENTION/PERHATIAN */}
          {beltNo && sqCode && names.length > 0 && (
            <div className="absolute left-1/2 transform -translate-x-1/2 top-8">
              <ClientOnly>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h1 className="text-6xl font-extrabold text-white drop-shadow-lg mb-2 text-center">
                      {headerTexts[index].title}
                    </h1>
                    <p
                      className="text-5xl text-white text-center"
                      suppressHydrationWarning
                    >
                      {headerTexts[index].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </ClientOnly>
            </div>
          )}

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

              {/* InJourney Logo in center of triangle area */}
              <div
                className="absolute top-1/2 -translate-y-1/2 left-8 w-80 h-32 overflow-hidden"
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/Logo_Injourney.png"
                    alt="InJourney Logo"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-full border-t-2 border-white/30 -mt-2"></div>

        {/* Flight Information Section */}
        <div
          className={`flex-1 flex ${names.length > 0 ? "items-start" : "items-center"} justify-center px-4 pt-4 pb-16`}
        >
          <div className="w-full">
            {/* Flight Data Table - No Card */}
            {names.length > 0 ? (
              <div className="w-full">
                {/* Table Header */}
                <div className="flex items-center py-2 mb-1 px-12">
                  {/* <div className="w-64 flex items-center justify-start">
                    <div className="text-7xl font-bold text-white">AIRLINE</div>
                  </div>
                  <div className="text-7xl font-bold text-white flex-1 text-center">
                    FLIGHT
                  </div> */}
                  <div className="text-6xl font-bold text-white flex-1 text-center">
                    <div className="flex items-center justify-center gap-8">
                      <div className="bg-white/0 w-56 h-28 flex items-center justify-center">
                        <div className="relative w-full h-full p-3 flex items-center justify-center">
                          <Image
                            src={`/airline/${sqCode.substring(0, 2)}.png`}
                            alt={`${sqCode.substring(0, 2)} Logo`}
                            fill
                            className="object-contain object-center"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      </div>
                      /
                      <span className="inline-block">{sqCode}</span>
                    </div>
                  </div>
                </div>

                {/* Table Data with Fade Animation */}
                <div className="space-y-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {getCurrentPagePassengers().map((name, idx) => (
                        <div
                          key={`${currentPage}-${idx}`}
                          className="flex items-center py-6 px-12"
                        >
                          {/* Airline Logo */}
                          {/* <div className="w-64 flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 w-56 h-28 flex items-center justify-center">
                              <div className="relative w-full h-full p-3 flex items-center justify-center">
                                <Image
                                  src={`/airline/${sqCode.substring(0, 2)}.png`}
                                  alt={`${sqCode.substring(0, 2)} Logo`}
                                  fill
                                  className="object-contain object-center"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                  }}
                                />
                              </div>
                            </div>
                          </div> */}

                          {/* Flight Number */}
                          {/* <div className="text-7xl font-bold text-white flex-1 text-center">
                            {sqCode}
                          </div> */}

                          {/* Passenger Name */}
                          <div className="text-7xl font-bold text-white w-full max-w-xl mx-auto text-left whitespace-nowrap">
                            {name}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            ) : freeText ? (
              <div className="w-full flex items-center justify-center -mt-6 md:-mt-8">
                <div className="relative w-full max-w-7xl flex justify-center">
                  <div className="absolute -inset-1 bg-gradient-to-br from-white/10 via-blue-300/5 to-white/10 rounded-xl blur-md"></div>
                  <div
                    className="relative p-10 rounded-xl bg-black/10 backdrop-blur-sm border border-white/20 w-full mx-auto flex items-center justify-center"
                    style={{ minHeight: "450px" }}
                  >
                    <div className="flex flex-col items-center justify-center w-full h-full text-white text-center">
                      <TextType
                        text={freeText}
                        typingSpeed={100}
                        pauseDuration={2000}
                        deletingSpeed={50}
                        showCursor={true}
                        cursorCharacter="|"
                        loop={true}
                        noDelete={true}
                        className="text-6xl font-bold text-white whitespace-pre-line"
                      />
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-white/30 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-white/30 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-white/30 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-white/30 rounded-br-xl"></div>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center -mt-6 md:-mt-8">
                <div className="relative w-full max-w-7xl flex justify-center">
                  <div className="absolute -inset-1 bg-gradient-to-br from-white/10 via-blue-300/5 to-white/10 rounded-xl blur-md"></div>
                  <div
                    className="relative p-10 rounded-xl bg-black/10 backdrop-blur-sm border border-white/20 w-full mx-auto flex items-center justify-center"
                    style={{ minHeight: "450px" }}
                  >
                    <div className="flex flex-col items-center justify-center w-full h-full text-white text-center">
                      <TextType
                        text={"NO FLIGHT INFORMATION"}
                        typingSpeed={100}
                        pauseDuration={2000}
                        deletingSpeed={50}
                        showCursor={true}
                        cursorCharacter="|"
                        loop={true}
                        noDelete={true}
                        className="text-6xl font-bold text-white"
                      />
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-white/30 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-white/30 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-white/30 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-white/30 rounded-br-xl"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Static bilingual notice above running text */}
        <div className="fixed bottom-20 left-0 right-0 py-5">
          <div className="w-full flex items-center justify-center">
            <ClientOnly>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`notice-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center justify-center"
                >
                  {index === 0 ? (
                    <div className="flex items-center gap-6">
                      <span className="text-4xl md:text-5xl text-white font-medium whitespace-nowrap">
                        Please Approach Baggage Service {handleBy.toUpperCase() || "JAS"}
                      </span>
                      <div className="relative w-40 h-16">
                        <Image src={handlerLogoSrc} alt="Handler Logo" fill className="object-contain" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6">
                      <span className="text-4xl md:text-5xl text-white font-medium whitespace-nowrap">
                        Harap Menuju Layanan Bagasi {handleBy.toUpperCase() || "JAS"}
                      </span>
                      <div className="relative w-40 h-16">
                        <Image src={handlerLogoSrc} alt="Handler Logo" fill className="object-contain" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </ClientOnly>
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
                  ? isGapuraHandler
                    ? "IN FRONT OF BELT 2"
                    : "IN FRONT OF BELT 1"
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
                  ? isGapuraHandler
                    ? "DI DEPAN BELT 2"
                    : "DI DEPAN BELT 1"
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
                  ? isGapuraHandler
                    ? "IN FRONT OF BELT 2"
                    : "IN FRONT OF BELT 1"
                  : "AT ARRIVAL HALL INFORMATION COUNTER"}{" "}
                OR APPROACH OUR GROUND STAFF FOR ASSISTANCE
              </span>
              <span className="text-blue-700 text-3xl mr-16">|</span>
              <span className="text-2xl md:text-3xl text-blue-900 font-bold whitespace-nowrap mr-16">
                HARAP MELAPOR KE KONTER LAYANAN BAGASI{" "}
                {handleBy?.toUpperCase() || "JAS"}{" "}
                {beltNo
                  ? isGapuraHandler
                    ? "DI DEPAN BELT 2"
                    : "DI DEPAN BELT 1"
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