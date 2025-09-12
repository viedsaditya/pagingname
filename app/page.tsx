"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getPagings } from "./utils/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faPlaneArrival } from '@fortawesome/free-solid-svg-icons';

export default function PagingScreen() {
  const searchParams = useSearchParams();
  const beltNo = useMemo(() => searchParams.get("belt_no"), [searchParams]);

  const [sqCode, setSqCode] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [newSqCode, setNewSqCode] = useState("");
  const [newNames, setNewNames] = useState<string[]>([]);

  // Helper fetcher
  const fetchData = async () => {
    if (!beltNo) return;
    const allPagings = await getPagings();
    const filtered = (allPagings || []).filter(
      (p: any) => String(p.belt_no) === String(beltNo)
    );
    if (Array.isArray(filtered) && filtered.length > 0) {
      setSqCode(filtered[0].flight_no || "");
      const passengerNames = filtered
        .flatMap((item: any) => String(item.name_passenger || "").split(","))
        .map((n: string) => n.trim())
        .filter(Boolean);
      setNames(passengerNames);
      setNewSqCode(filtered[0].flight_no || "");
      setNewNames(passengerNames);
    } else {
      setSqCode("");
      setNames([]);
      setNewSqCode("");
      setNewNames([]);
    }
  };

  // Fetch sekali ketika beltNo berubah
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beltNo]);

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
  }, [beltNo]);

  const beltNoDisplay = beltNo;

  // Slide content dinamis
  const slides = [
    {
      id: 1,
      content: (
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-cyan-300 drop-shadow-lg">
            ATTENTION
          </h1>
          <p className="text-3xl md:text-5xl text-gray-100 mb-10">
            THE FOLLOWING PASSENGER(S) <br />
            OF {sqCode} / {new Date().toLocaleDateString('en-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()} :

             {/* <div className="text-sm md:text-base text-gray-300">
              {new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
            </div> */}
          </p>
          <div
            className={`mt-12 grid ${
              names.length > 4 ? "grid-cols-3 gap-10" : "grid gap-6"
            }`}
          >
            {names.map((name, idx) => (
              <p
                key={idx}
                className="text-3xl md:text-5xl font-bold text-white text-center"
              >
                {/* {idx + 1}. {name} */}
                {name}
              </p>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div className="text-center space-y-10">
          <p className="text-3xl md:text-5xl text-cyan-200 font-semibold">
            PLEASE REPORT TO PT JAS BAGGAGE SERVICES COUNTER
          </p>
          <p className="text-3xl md:text-5xl text-cyan-200 font-semibold">
            {beltNo 
              ? `IN FRONT OF BELT ${beltNoDisplay}` 
              : "AT ARRIVAL HALL INFORMATION COUNTER"
            }
          </p>
          <p className="text-2xl md:text-4xl text-gray-300">OR</p>
          <p className="text-3xl md:text-5xl text-cyan-200 font-semibold">
            APPROACH OUR GROUND STAFF FOR ASSISTANCE
          </p>
        </div>
      ),
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Handler untuk update data (opsional, jika ingin edit)
  const handleSave = () => {
    setSqCode(newSqCode);
    setNames([...newNames]);
    setEditMode(false);
  };

  // Handler untuk tambah nama baru (opsional)
  const handleAddName = () => {
    setNewNames([...newNames, "NEW NAME"]);
  };

  // Handler untuk hapus nama (opsional)
  const handleRemoveName = (idx: number) => {
    setNewNames(newNames.filter((_, i) => i !== idx));
  };

  return (
    <div
      className="relative h-screen w-screen flex flex-col overflow-hidden"
    >
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950"></div>
        
        {/* Subtle JAS Logo watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.09]">
          <Image 
            src="/airport_building.png" 
            alt="Background Logo" 
            fill
            priority
            className="object-cover"
          />
        </div>
        
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
      
      {/* Premium Header with Logos */}
      <div className="relative z-20 px-6 py-3">
        <div className="relative flex justify-between items-center">
          {/* Glassmorphism background */}
          {/* <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-800/60 via-blue-900/50 to-slate-800/60 backdrop-blur-md border-y border-white/10 shadow-lg"></div> */}
          
          {/* JAS Logo - Left Side */}
          <div className="relative flex items-center z-10">
            <div className="transition-all duration-300">
              <Image
                src="/Logo_JAS.png"
                alt="JAS Logo"
                width={90}
                height={45}
                className="h-10 w-auto object-contain group-hover:scale-105 transition-all duration-300"
              />
            </div>
          </div>

          {/* Time Now */}
          <div className="relative text-center text-white z-10">
            <div className="text-lg md:text-2xl font-semibold">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>

          {/* Airline Logo or Landing Airplane - Right Side */}
          <div className="relative flex items-center z-10">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-sm opacity-0 transition-opacity duration-300"></div>
              {beltNo ? (
                <Image
                  src={`/airlines/${sqCode?.substring(0, 2) || "EY"}.png`}
                  alt={`${sqCode?.substring(0, 2) || ""} Logo`}
                  width={64}
                  height={64}
                  className="h-12 w-auto object-contain transition-all duration-300"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.src = "/airlines/EY.png"; // Default to EY if not found
                  }}
                />
              ) : (
                <div className="relative p-1">
                  <FontAwesomeIcon 
                    icon={faPlaneArrival} 
                    className="text-white text-4xl transform p-2" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="relative z-10 flex items-center justify-center flex-1 w-full p-8">
        <div className="relative w-full max-w-5xl">
          {/* Subtle content frame */}
          <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-slate-500/10 rounded-xl blur-md"></div>
          
          {/* Main content container */}
          <div className="relative p-8 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full"
              >
                {slides[index].content}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyan-400/30 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyan-400/30 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-400/30 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-400/30 rounded-br-xl"></div>
        </div>
      </div>

      {/* CRUD Form (opsional, bisa dihapus jika hanya display) */}
      {/* ...form code here jika ingin edit... */}

      {/* Footer accent */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-950/60 to-transparent z-5"></div>
    </div>
  );
}
