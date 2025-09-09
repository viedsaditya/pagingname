"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getPagings } from "./utils/api";

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
    const filtered = (allPagings || []).filter((p: any) => String(p.belt_no) === String(beltNo));
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
          <h1 className="text-6xl md:text-8xl font-extrabold text-cyan-300 drop-shadow-lg">
            ATTENTION
          </h1>
          <p className="text-3xl md:text-5xl text-gray-100">
            THE FOLLOWING PASSENGER(S) <br />
            OF {sqCode}/25 AUG 2025:
          </p>
          <div className={`space-y-4 mt-8 grid ${names.length > 4 ? "grid-cols-2 gap-x-8" : ""}`}>
            {names.map((name, idx) => (
              <p key={idx} className="text-4xl md:text-6xl font-bold text-white">
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
            IN FRONT OF BELT {beltNoDisplay}
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
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden 
                    bg-gradient-to-br from-gray-900 via-blue-950 to-black">
      {/* Animated cloud/shape blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-move-slow"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-green-400/20 rounded-full blur-3xl animate-move-reverse"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-move-slow"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full w-full p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full"
          >
            {slides[index].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CRUD Form (opsional, bisa dihapus jika hanya display) */}
      {/* ...form code here jika ingin edit... */}

      {/* Extra futuristic grid lines */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );
}