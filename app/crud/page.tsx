"use client";
import { useEffect, useState } from "react";
import {
  addPaging,
  deletePaging,
  getPagings,
  updatePaging,
} from "../utils/api";
//tambahkan dua import baru untuk impelementasi authentication
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  //tambahan fitur untuk pagination
  const ITEM_PER_PAGE = 10; //jumlah data per halaman
  const [currentPage, setCurrentPage] = useState(1); //halaman saat ini
  const [totalPages, setTotalPages] = useState(1); //total halaman

  // tambahkan variable router
  const router = useRouter();

  //=============VIEW DATA
  //siapkan variable state yang dibutuhkan
  const [pagings, setPagings] = useState<Array<{
    id: number;
    belt_no: string;
    flight_no: string;
    name_passenger: string;
    handle_by: string;
    free_text: string;
    status: number;
  }>>([]);
  const [form, setForm] = useState({
    id: 0,
    belt_no: "",
    flight_no: "",
    name_passenger: "",
    handle_by: "",
    free_text: "",
    status: 0,
  });

  //siapkan state untuk menangani error validasi form
  const [error, setError] = useState({
    belt_no: "",
    flight_no: "",
    name_passenger: "",
    handle_by: "",
    free_text: "",
    status: "",
  });

  //state untuk menangani error dari API
  const [apiError, setApiError] = useState("");

  //siapkan function untuk validasi form
  const validateForm = () => {
    const newErrors = {
      belt_no: "",
      flight_no: "",
      name_passenger: "",
      handle_by: "",
      free_text: "",
      status: "",
    };
    // Check if Belt No is empty
    if (!form.belt_no.trim()) {
      newErrors.belt_no = "Belt No is required";
    }

    // Check if Flight No is empty
    if (!form.flight_no.trim()) {
      newErrors.flight_no = "Flight No is required";
    }

    // Check if Name Passenger is empty
    if (!form.name_passenger.trim()) {
      newErrors.name_passenger = "Name Passenger is required";
    }

    if (!form.handle_by.trim()) {
      newErrors.handle_by = "Handle By is required";
    }

    // Check if Free Text is empty
    if (!form.free_text.trim()) {
      newErrors.free_text = "Free Text is required";
    }

    // Check for duplicate belt number in the client side (optional, server will also check)
    const duplicateBelt = pagings.find(
      (p) => p.belt_no === form.belt_no && p.id !== form.id
    );

    if (duplicateBelt) {
      // Only show the yellow alert style message with a gentler wording
      setApiError(
        `Belt number ${form.belt_no} is already in use. Please choose another belt number.`
      );
      return false; // Prevent form submission
    }

    //kumpulkan error ke state
    setError(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  //method untuk memanggil api unutk mengambil semua data paging
  // const fetchPagings = async () => {
  //     const data = await getPagings();
  //     setPagings(data);

  //     //hitung jumlah halaman
  //     setTotalPages(Math.ceil(data.length / ITEM_PER_PAGE));
  // };
  const fetchPagings = async () => {
    const response = await getPagings();
    // Pastikan data adalah array
    const data = Array.isArray(response)
      ? response
      : Array.isArray(response.data)
      ? response.data
      : [];
    setPagings(data);

    // Hitung jumlah halaman
    setTotalPages(Math.ceil(data.length / ITEM_PER_PAGE));
  };

  //method untuk menghandle next atau previous halaman
  const handlePageChange = (newPage: number) => {
    //jika halaman sudah mentok tombol next atau previous tidak bisa diklik
    if (newPage >= 1 && newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  //method untuk memecah data yang akan ditampilkan per 10 records
  const paginatedPagings = pagings.slice(
    (currentPage - 1) * ITEM_PER_PAGE,
    currentPage * ITEM_PER_PAGE
  );

  //panggil method fetchPagings secara background
  useEffect(() => {
      //pastikan data employees muncul jika user sudah login
      const loggedIn = Cookies.get("logged_in");
      //jika user belum login redirect ke halaman login
      if (!loggedIn) {
        router.push("/login");
      } else { //jika user sudah login maka tampilkan data employee
    fetchPagings();
      }
  }, [router]);

  //=============UPDATE DATA
  //function untuk populate data ke form jika button edit diklik
  const handleEdit = (paging: {
    id: number;
    belt_no: string;
    flight_no: string;
    name_passenger: string;
    handle_by: string;
    free_text: string;
    status: number;
  }) => {
    setForm(paging);
  };

  //=============DELETE DATA
  //function untuk menghapus data jika button delete diklik
  const handleDelete = async (id: number) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this data?"
    );
    if (confirmation) {
      try {
        await deletePaging(id);
        //refresh data pada table
        fetchPagings();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Sorry, the data cannot be deleted";
        setApiError(errorMessage);
      }
    }
  };

  //=============BUTTON SUBMIT
  //function yang akan dipanggil ketika button submit diklik
  const handleSubmit = async () => {
    //jangan lupa validsi form
    if (!validateForm()) return;

    // Clear any previous API errors
    setApiError("");

    try {
      //jika id ada maka update data
      if (form.id) {
        await updatePaging(form);
      } else {
        // jika id tidak ada maka insert data
        await addPaging(form);
      }
      //setelah selesai kosongkan form
      setForm({
        id: 0,
        belt_no: "",
        flight_no: "",
        name_passenger: "",
        handle_by: "",
        free_text: "",
        status: 0,
      });
      //refresh data pada table
      fetchPagings();
    } catch (err: unknown) {
      // Set friendly message to display to user
      const errorMessage =
        err instanceof Error ? err.message : "Sorry, the data cannot be saved";
      setApiError(errorMessage);
      console.error("API Response Issue:", err);
    }
  };

  //=============LOGOUT
  //function akan dipanggil ketika button logout diklik
  const handleLogout = () => {
    //hapus cookie dan redirect ke halaman login
    Cookies.remove("logged_in");
    router.push("/login");
  };

  const handleShow = async (id: number) => {
    // Add confirmation dialog
    const confirmation = window.confirm(
      "Are you sure you want to mark this as SHOW?"
    );
    if (!confirmation) return;

    try {
      // Find the paging to update
      const pagingToUpdate = pagings.find((pag) => pag.id === id);

      if (pagingToUpdate) {
        // Create updated paging object with status 1 (show)
        const updatedPaging = {
          ...pagingToUpdate,
          status: 1,
        };

        // Update in the API
        await updatePaging(updatedPaging);

        // Update local state for immediate UI feedback
        const updatedPagings = pagings.map((pag) =>
          pag.id === id ? { ...pag, status: 1 } : pag
        );
        setPagings(updatedPagings);

        // Show success message
        setApiError("Status updated to SHOW successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setApiError("");
        }, 3000);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating status";
      setApiError(errorMessage);
      console.error("Error updating status:", err);
    }
  };

  const handleNoShow = async (id: number) => {
    // Add confirmation dialog
    const confirmation = window.confirm(
      "Are you sure you want to mark this as NO SHOW?"
    );
    if (!confirmation) return;

    try {
      // Find the paging to update
      const pagingToUpdate = pagings.find((pag) => pag.id === id);

      if (pagingToUpdate) {
        // Create updated paging object with status 0 (no show)
        const updatedPaging = {
          ...pagingToUpdate,
          status: 0,
        };

        // Update in the API
        await updatePaging(updatedPaging);

        // Update local state for immediate UI feedback
        const updatedPagings = pagings.map((pag) =>
          pag.id === id ? { ...pag, status: 0 } : pag
        );
        setPagings(updatedPagings);

        // Show success message
        setApiError("Status updated to NO SHOW successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setApiError("");
        }, 3000);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating status";
      setApiError(errorMessage);
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-slate-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        {/* Modern Header */}
        <div className="flex-1 bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-700/40 border border-white/10">
                <span className="text-2xl">✈️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  JAS Paging Management
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">            
              <button
                onClick={() => handleLogout()}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Modern Notification with Glass Morphism */}
        {apiError && (
          <div
            className="bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 text-white rounded-2xl px-6 py-4 mb-6 relative shadow-2xl animate-pulse"
            role="alert"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <strong className="font-bold text-emerald-200">Notification:</strong>
                  <span className="block sm:inline ml-2 text-gray-100">{apiError}</span>
                </div>
              </div>
              <button
                className="text-emerald-300 hover:text-emerald-100 transition-colors p-1"
                onClick={() => setApiError("")}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Example Button to Show How Duplicate Belt Error Looks */}
        {/* <div className="mb-4">
          <button
            type="button"
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            onClick={() => {
              // This is just a demonstration of how the error would look
              setApiError("DUPLICATE BELT NUMBER DETECTED! Belt number 5 is already assigned to flight SQ123 with passenger JOHN DOE. Please use a different belt number.");
            }}
          >
            CONTOH: Klik untuk Lihat Pesan Error Belt Double
          </button>
        </div> */}

        {/* Add Paging Form */}
        <div className="flex-1 bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/40 border border-white/10">
              ✏️
            </span>
            <h3 className="text-xl font-bold text-white">
              {form.id ? "Edit Paging Entry" : "Add New Paging Entry"}
            </h3>
          </div>

          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* First Row: Belt No, Flight No, Handle By */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Belt No */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Belt No
                </label>
                <input
                  type="text"
                  placeholder="Enter Belt No"
                  className="px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-700/50 transition-all duration-200"
                  value={form.belt_no}
                  onChange={(e) => setForm({ ...form, belt_no: e.target.value })}
                />
                {error.belt_no && (
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.belt_no}</span>
                  </p>
                )}
              </div>

              {/* Flight No */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Flight No
                </label>
                <input
                  type="text"
                  placeholder="Enter Flight No"
                  className="px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-700/50 transition-all duration-200"
                  value={form.flight_no}
                  onChange={(e) => setForm({ ...form, flight_no: e.target.value })}
                />
                {error.flight_no && (
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.flight_no}</span>
                  </p>
                )}
              </div>

              {/* Handle By */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Handle By
                </label>
                <select
                  className="px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:bg-slate-700/50 transition-all duration-200 appearance-none"
                  value={form.handle_by}
                  onChange={(e) => setForm({ ...form, handle_by: e.target.value })}
                  style={{ color: form.handle_by ? "white" : "#9CA3AF" }}
                >
                  <option value="" disabled hidden className="text-gray-400">
                    Select Handler
                  </option>
                  <option value="Jas" className="text-black bg-white">Jas</option>
                  <option value="Gapura" className="text-black bg-white">Gapura</option>
                </select>
                {error.handle_by && (
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.handle_by}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Second Row: Passenger Name and Default Text */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Passenger Name */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Passenger Name
                </label>
                <textarea
                  placeholder="Enter Passenger Name"
                  rows={4}
                  className="px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-700/50 transition-all duration-200 resize-vertical"
                  value={form.name_passenger}
                  onChange={(e) =>
                    setForm({ ...form, name_passenger: e.target.value })
                  }
                />
                {error.name_passenger && (
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.name_passenger}</span>
                  </p>
                )}
              </div>

              {/* Default Text */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Default Text
                </label>
                <textarea
                  placeholder="Enter Default Text"
                  rows={4}
                  className="px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-700/50 transition-all duration-200 resize-vertical"
                  value={form.free_text}
                  onChange={(e) => setForm({ ...form, free_text: e.target.value })}
                />
                {error.free_text && (
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.free_text}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              {/* {form.id && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      id: 0,
                      belt_no: "",
                      flight_no: "",
                      name_passenger: "",
                      handle_by: "",
                      free_text: "",
                      status: 0,
                    });
                    setError({
                      belt_no: "",
                      flight_no: "",
                      name_passenger: "",
                      handle_by: "",
                      free_text: "",
                      status: "",
                    });
                  }}
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
              )} */}
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors duration-200 text-sm font-medium"
              >
                {form.id ? "Update Paging" : "Add Paging"}
              </button>
            </div>
          </form>
        </div>

        {/* Paging Data Table */}
        <div className="flex-1 bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/40 border border-white/10">
                📋
              </span>
              Paging Management
            </h3>

         
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    ID
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Belt No
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Flight No
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Passenger
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Handle By
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Default Text
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedPagings.length > 0 ? (
                  paginatedPagings.map((pag) => (
                    <tr
                      key={pag.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="py-4 px-4 text-gray-400">
                        {pag.id}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-cyan-400">
                          {pag.belt_no}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white font-medium">
                          {pag.flight_no}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white font-medium">
                          {pag.name_passenger}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            pag.handle_by === 'Jas'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          }`}
                        >
                          {pag.handle_by}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-300 text-sm max-w-xs truncate" title={pag.free_text}>
                          {pag.free_text}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap ${
                            pag.status === 1
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
                        >
                          {pag.status === 1 ? 'SHOW' : 'NO SHOW'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(pag)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200 text-xs font-medium"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(pag.id)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200 text-xs font-medium"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Delete
                          </button>
                          <button
                            onClick={() => handleShow(pag.id)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors duration-200 text-xs font-medium"
                            title="Show"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                            Show
                          </button>
                          <button
                            onClick={() => handleNoShow(pag.id)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30 transition-colors duration-200 text-xs font-medium"
                            title="No Show"
                          >
                            <FontAwesomeIcon icon={faEyeSlash} className="mr-1" />
                            Hide
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center">
                      <div className="text-gray-400">
                        No paging data available
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-4 border-t border-white/10 gap-4">
            <div className="text-sm text-gray-400">
              {pagings.length > 0 ? (
                <>
                  Showing {((currentPage - 1) * ITEM_PER_PAGE) + 1} to{" "}
                  {Math.min(currentPage * ITEM_PER_PAGE, pagings.length)} of{" "}
                  {pagings.length} entries
                </>
              ) : (
                <>Showing 0 to 0 of 0 entries</>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-700/30 border border-slate-600/30 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {pagings.length === 0 ? (
                  <button className="w-8 h-8 flex items-center justify-center rounded-md text-sm bg-slate-700/30 text-white font-medium shadow-sm">
                    1
                  </button>
                ) : (
                  Array.from({ length: Math.max(1, Math.min(5, totalPages)) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 shadow-sm ${
                          currentPage === pageNumber
                            ? "bg-cyan-700/30 text-white"
                            : "bg-slate-700/30 border border-slate-600/30 text-gray-300 hover:bg-slate-700/50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })
                )}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages || 1, currentPage + 1))}
                disabled={currentPage === (totalPages || 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-700/30 border border-slate-600/30 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
