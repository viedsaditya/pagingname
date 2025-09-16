"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getPagings } from "./utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlane, faPlaneArrival } from "@fortawesome/free-solid-svg-icons";

export default function PagingScreen() {
  const searchParams = useSearchParams();
  const beltNo = useMemo(() => searchParams.get("belt_no"), [searchParams]);

  const [sqCode, setSqCode] = useState("");
  const [names, setNames] = useState<string[]>([]);

  // State for edit mode functionality (currently unused)
  /* 
  const [editMode, setEditMode] = useState(false);
  const [newSqCode, setNewSqCode] = useState("");
  const [newNames, setNewNames] = useState<string[]>([]);
  */

  // Define types for API response
  interface PagingItem {
    belt_no: string | number;
    flight_no?: string;
    name_passenger?: string;
    [key: string]: unknown; // For other properties
  }

  // Helper fetcher with useCallback to prevent recreation on each render
  const fetchData = useCallback(async () => {
    if (!beltNo) return;
    const allPagings = await getPagings();
    const filtered = (allPagings || []).filter(
      (p: PagingItem) => String(p.belt_no) === String(beltNo)
    );
    if (Array.isArray(filtered) && filtered.length > 0) {
      setSqCode(filtered[0].flight_no || "");
      const passengerNames = filtered
        .flatMap((item: PagingItem) =>
          String(item.name_passenger || "").split(",")
        )
        .map((n: string) => n.trim())
        .filter(Boolean);
      setNames(passengerNames);
      // Edit mode variables commented out
      // setNewSqCode(filtered[0].flight_no || "");
      // setNewNames(passengerNames);
    } else {
      setSqCode("");
      setNames([]);
      // Edit mode variables commented out
      // setNewSqCode("");
      // setNewNames([]);
    }
  }, [beltNo]);

  // Fetch sekali ketika beltNo berubah
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  const headerTexts = [
    {
      id: 1,
      title: "ATTENTION",
      description: (
        <>
          <span className="block mb-3">The Following Passenger(s)</span>
          of <strong>{sqCode}</strong> /{" "}
          {new Date().toLocaleDateString("en-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}{" "}
          :
        </>
      ),
      // description: <>THE FOLLOWING PASSENGER(S) <br/>OF <strong>{sqCode}</strong> / {new Date().toLocaleDateString('en-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()} :</>
    },
    {
      id: 2,
      title: "PERHATIAN",
      description: (
        <>
          <span className="block mb-3">Penumpang Berikut</span>
          Dari <strong>{sqCode}</strong> /{" "}
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          :
        </>
      ),
      // description: <>PENUMPANG BERIKUT <br/>DARI <strong>{sqCode}</strong> / {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()} :</>
    },
  ];

  // Animation setup for language switching
  // Timer interval already set up above

  // Timer interval already set up above

  /* 
  // Handler functions for edit mode (currently unused, but kept for future implementation)
  const handleSave = () => {
    setSqCode(newSqCode);
    setNames([...newNames]);
    setEditMode(false);
  };

  const handleAddName = () => {
    setNewNames([...newNames, "NEW NAME"]);
  };

  const handleRemoveName = (idx: number) => {
    setNewNames(newNames.filter((_, i) => i !== idx));
  };
  */

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950"></div>

        {/* Subtle JAS Logo watermark */}
        {/* <div className="absolute inset-0 flex items-center justify-center opacity-[0.09]">
          <Image 
            src="/airport_building.png" 
            alt="Background Logo" 
            fill
            priority
            className="object-cover"
          />
        </div> */}

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

      {/* Clean and Minimal Header */}
      <div className="relative z-20 px-6 py-4 border-b border-gray-700 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 backdrop-blur-md">
        <div className="flex justify-between items-center">
          {/* JAS Logo */}
          <div className="flex items-center bg-white/50 p-4 rounded">
            <Image
              src="/Logo_JAS.png"
              alt="JAS Logo"
              width={140}
              height={70}
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Current Time and Date */}
          <div className="text-center text-white">
            <div className="text-3xl font-semibold">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-xl text-gray-400">
              {new Date().toLocaleDateString("en-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })} {" "}
              | CGK
            </div>
          </div>

          {/* Airline Logo or Icon */}
          <div className="flex items-center bg-white/50 p-4 rounded">
            {beltNo ? (
              <Image
                src={`/airlines/${sqCode?.substring(0, 2) || "EY"}.png`}
                alt={`${sqCode?.substring(0, 2) || ""} Logo`}
                width={140}
                height={70}
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/airlines/EY.png";
                }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faPlaneArrival}
                className="text-white text-3xl"
              />
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="relative z-10 flex flex-col items-center flex-1 w-full p-8 pt-4 pb-0 space-y-0">
        {/* Header Section - Without Frame */}
        <div className="w-full max-w-5xl text-center mb-0">
          <AnimatePresence mode="wait">
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
              <p className="text-3xl md:text-5xl text-gray-100 mb-1 mt-2">
                {headerTexts[index].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Passenger Names Section - With Frame */}
        <div className="relative w-full max-w-7xl flex justify-center mt-6">
          {/* Subtle content frame */}
          <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-slate-500/10 rounded-xl blur-md mt-6"></div>

          {/* Main content container - Only for passenger names - with wider frame */}
          <div className="relative p-10 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10 w-full mx-auto mt-6">
            {/* Only passenger names grid - horizontal layout with fixed columns, centered with name wrapping */}
            <div className="grid grid-cols-4 gap-x-12 gap-y-8 px-6">
              {names.map((name, idx) => (
                <div key={idx} className="px-6 flex items-center justify-center">
                  <p
                    className="text-3xl md:text-5xl font-bold text-white text-center break-words hyphens-auto"
                    style={{ 
                      maxWidth: '100%', 
                      lineHeight: '1.1', 
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative corner elements - moved to follow the same margin as the frame */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyan-400/30 rounded-tl-xl mt-6"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyan-400/30 rounded-tr-xl mt-6"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-400/30 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-400/30 rounded-br-xl"></div>
        </div>
      </div>

      {/* CRUD Form (opsional, bisa dihapus jika hanya display) */}
      {/* ...form code here jika ingin edit... */}

      {/* Footer accent - Removed to make more space */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950/60 to-transparent z-5"></div> */}

      {/* Clean and Minimal Running Text Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 border-t border-gray-700 py-4 overflow-hidden">
        <div className="animate-marquee flex items-center space-x-8">
          {/* English Message */}
          <span className="flex items-center space-x-2">
            {/* <FontAwesomeIcon
              icon={faPlane}
              className="text-cyan-400 text-3xl"
            /> */}
            <span className="text-xl md:text-2xl text-cyan-300 font-medium whitespace-nowrap">
              PLEASE REPORT TO PT JAS BAGGAGE SERVICES COUNTER {beltNo ? `IN FRONT OF BELT 1` : "AT ARRIVAL HALL INFORMATION COUNTER"} OR APPROACH OUR GROUND STAFF FOR ASSISTANCE
            </span>
          </span>

          {/* Separator */}
          <span className="text-cyan-400 text-2xl">|</span>

          {/* Indonesian Message */}
          <span className="flex items-center space-x-2">
            {/* <FontAwesomeIcon
              icon={faPlane}
              className="text-cyan-400 text-3xl"
            /> */}
            <span className="text-xl md:text-2xl text-cyan-300 font-medium whitespace-nowrap">
              HARAP MELAPOR KE KONTER LAYANAN BAGASI PT JAS {beltNo ? `DI DEPAN BELT 1` : "DI KONTER INFORMASI HALL KEDATANGAN"} ATAU HUBUNGI STAF DARAT KAMI UNTUK BANTUAN
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
