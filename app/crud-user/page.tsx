"use client";
import { useEffect, useState } from "react";
import {
  addUser,
  deleteUser,
  getUsers,
  updateUser,
  getStations,
} from "../utils/api";
//tambahkan dua import baru untuk impelementasi authentication
import { useRouter } from "next/navigation";
import { isAuthenticated, logout } from "../utils/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

const Home = () => {
  //tambahan fitur untuk pagination
  const ITEM_PER_PAGE = 10; //jumlah data per halaman
  const [currentPage, setCurrentPage] = useState(1); //halaman saat ini
  const [totalPages, setTotalPages] = useState(1); //total halaman

  // tambahkan variable router
  const router = useRouter();

  // state untuk logout countdown
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [countdown, setCountdown] = useState(3);

  //=============VIEW DATA
  //siapkan variable state yang dibutuhkan
  const [users, setUsers] = useState<
    Array<{
      id_usr: number;
      id_sts: number;
      fullname: string;
      username: string;
      password: string;
      email: string;
      nohp: string;
      is_active: number;
    }>
  >([]);

  const [stations, setStations] = useState<
    Array<{
      id_sts: number;
      code_station: string;
      name_station: string;
    }>
  >([]);
  const [form, setForm] = useState({
    id_usr: 0,
    id_sts: 0,
    fullname: "",
    username: "",
    password: "",
    email: "",
    nohp: "",
    is_active: 1,
  });

  //prepare state to handle form validation errors
  const [error, setError] = useState({
    id_sts: "",
    fullname: "",
    username: "",
    password: "",
    email: "",
    nohp: "",
    is_active: "",
  });

  //state untuk menangani error dari API
  const [apiError, setApiError] = useState("");

  //state untuk menangani success notification
  const [successMessage, setSuccessMessage] = useState("");

  //state untuk menangani show/hide password
  const [showPassword, setShowPassword] = useState(false);

  //fungsi helper untuk menampilkan success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setApiError(""); // Clear any error message
    setTimeout(() => {
      setSuccessMessage("");
    }, 4000); // Hide after 4 seconds
  };

  //fungsi helper untuk menampilkan error message
  const showErrorMessage = (message: string) => {
    setApiError(message);
    setSuccessMessage(""); // Clear any success message
  };

  //prepare function for form validation
  const validateForm = () => {
    const newErrors = {
      id_sts: "",
      fullname: "",
      username: "",
      password: "",
      email: "",
      nohp: "",
      is_active: "",
    };

    // Check if Station is selected
    if (!form.id_sts || form.id_sts === 0) {
      newErrors.id_sts = "Station is required";
    }

    // Check if Full Name is empty
    if (!form.fullname.trim()) {
      newErrors.fullname = "Full Name is required";
    }

    // Check if Username is empty
    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    }

    // Check if Password is empty (only for new users or when password is being changed)
    if (!form.password.trim() && form.id_usr === 0) {
      newErrors.password = "Password is required";
    }

    // Check if Email is empty
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email format is invalid";
    }

    // Check if Phone Number is empty
    if (!form.nohp.trim()) {
      newErrors.nohp = "Phone Number is required";
    }

    // Check for duplicate username in the client side (optional, server will also check)
    const duplicateUser = users.find(
      (u) => u.username === form.username && u.id_usr !== form.id_usr
    );

    if (duplicateUser) {
      setApiError(
        `Username ${form.username} is already taken. Please choose another username.`
      );
      return false; // Prevent form submission
    }

    //kumpulkan error ke state
    setError(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  //method untuk memanggil api untuk mengambil semua data user
  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const response = await getUsers();
      console.log("API Response:", response);

      // Pastikan data adalah array
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
        ? response.data
        : [];

      console.log("Processed data:", data);
      setUsers(data);

      // Hitung jumlah halaman
      setTotalPages(Math.ceil(data.length / ITEM_PER_PAGE));
    } catch (error) {
      console.error("Error fetching users:", error);
      setApiError("Failed to fetch users from database");
    }
  };

  //method untuk memanggil api untuk mengambil semua data station
  const fetchStations = async () => {
    try {
      console.log("Fetching stations...");
      const response = await getStations();
      console.log("Stations API Response:", response);

      // Pastikan data adalah array
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
        ? response.data
        : [];

      console.log("Processed stations data:", data);
      setStations(data);
    } catch (error) {
      console.error("Error fetching stations:", error);
      setApiError("Failed to fetch stations from database");
    }
  };

  //method untuk menghandle next atau previous halaman
  const handlePageChange = (newPage: number) => {
    //jika halaman sudah mentok tombol next atau previous tidak bisa diklik
    if (newPage >= 1 && newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  //method untuk memecah data yang akan ditampilkan per 10 records
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEM_PER_PAGE,
    currentPage * ITEM_PER_PAGE
  );

  //panggil method fetchUsers secara background
  useEffect(() => {
    //pastikan user masih dalam session 6 jam
    if (!isAuthenticated()) {
      //if session expired or not logged in redirect to login page
      router.push("/login");
      return;
    }

    //jika user masih authenticated maka tampilkan data
    fetchUsers();
    fetchStations();
  }, [router]);

  //=============UPDATE DATA
  //function to populate data to form when edit button is clicked
  const handleEdit = (user: {
    id_usr: number;
    id_sts: number;
    fullname: string;
    username: string;
    password: string;
    email: string;
    nohp: string;
    is_active: number;
  }) => {
    setForm({
      id_usr: user.id_usr,
      id_sts: user.id_sts,
      fullname: user.fullname,
      username: user.username,
      password: "", // Don't populate password for security
      email: user.email,
      nohp: user.nohp,
      is_active: user.is_active,
    });
    //reset password visibility when editing
    setShowPassword(false);
  };

  //=============DELETE DATA
  //function to delete data when delete button is clicked
  const handleDelete = async (id_usr: number) => {
    // Find user to get name for notification
    const userToDelete = users.find((user) => user.id_usr === id_usr);
    const userName = userToDelete ? userToDelete.fullname : "User";

    const confirmation = window.confirm(
      `Are you sure you want to delete "${userName}"?`
    );
    if (confirmation) {
      try {
        await deleteUser(id_usr);
        showSuccessMessage(`User "${userName}" has been deleted successfully!`);
        //refresh data pada table
        fetchUsers();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Sorry, the user cannot be deleted";
        showErrorMessage(errorMessage);
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
      console.log("Form data being submitted:", form);
      //jika id_usr ada maka update data
      if (form.id_usr) {
        console.log("Updating user...");
        await updateUser(form);
        showSuccessMessage(
          `User "${form.fullname}" has been updated successfully!`
        );
      } else {
        // jika id_usr tidak ada maka insert data
        console.log("Adding new user...");
        await addUser(form);
        showSuccessMessage(
          `User "${form.fullname}" has been added successfully!`
        );
      }
      //after completion clear the form
      setForm({
        id_usr: 0,
        id_sts: 0,
        fullname: "",
        username: "",
        password: "",
        email: "",
        nohp: "",
        is_active: 1,
      });
      //reset password visibility
      setShowPassword(false);
      //refresh data pada table
      fetchUsers();
    } catch (err: unknown) {
      // Set friendly message to display to user
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Sorry, the user data cannot be saved";
      showErrorMessage(errorMessage);
      console.error("API Response Issue:", err);
    }
  };

  //=============LOGOUT
  //function akan dipanggil ketika button logout diklik
  const handleLogout = () => {
    logout(); // Use utility function to clear all session cookies
    setIsLoggingOut(true);
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Use setTimeout to defer navigation outside of state update
          setTimeout(() => {
            router.push("/login");
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleActivate = async (id_usr: number) => {
    // Add confirmation dialog
    const confirmation = window.confirm(
      "Are you sure you want to activate this user?"
    );
    if (!confirmation) return;

    try {
      // Find the user to update
      const userToUpdate = users.find((user) => user.id_usr === id_usr);

      if (userToUpdate) {
        // Create updated user object with is_active 1 (active)
        const updatedUser = {
          ...userToUpdate,
          is_active: 1,
        };

        // Update in the API
        await updateUser(updatedUser);

        // Update local state for immediate UI feedback
        const updatedUsers = users.map((user) =>
          user.id_usr === id_usr ? { ...user, is_active: 1 } : user
        );
        setUsers(updatedUsers);

        // Show success message
        showSuccessMessage(
          `User "${userToUpdate.fullname}" has been activated successfully!`
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating user status";
      showErrorMessage(errorMessage);
      console.error("Error updating user status:", err);
    }
  };

  const handleDeactivate = async (id_usr: number) => {
    // Add confirmation dialog
    const confirmation = window.confirm(
      "Are you sure you want to deactivate this user?"
    );
    if (!confirmation) return;

    try {
      // Find the user to update
      const userToUpdate = users.find((user) => user.id_usr === id_usr);

      if (userToUpdate) {
        // Create updated user object with is_active 0 (inactive)
        const updatedUser = {
          ...userToUpdate,
          is_active: 0,
        };

        // Update in the API
        await updateUser(updatedUser);

        // Update local state for immediate UI feedback
        const updatedUsers = users.map((user) =>
          user.id_usr === id_usr ? { ...user, is_active: 0 } : user
        );
        setUsers(updatedUsers);

        // Show success message
        showSuccessMessage(
          `User "${userToUpdate.fullname}" has been deactivated successfully!`
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating user status";
      showErrorMessage(errorMessage);
      console.error("Error updating user status:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md">
          <div className="text-center animate-fade-in">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-2 border-blue-400/50 shadow-xl">
              <span className="text-3xl font-bold text-blue-200">
                {countdown}
              </span>
            </div>
            <p className="text-white text-xl font-semibold mb-2">
              Logout Successful
            </p>
            <p className="text-white/60 text-sm">
              Redirecting to login page...
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Modern Header */}
        <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700/60 to-slate-800/60 border border-white/20 overflow-hidden shadow-lg">
                <Image
                  src="/logojasaja.png"
                  alt="JAS"
                  width={48}
                  height={48}
                  className="w-11 h-11 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  JAS User Management
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Manage your user accounts
                </p>
              </div>
            </div>

            <button
              onClick={() => handleLogout()}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30 hover:from-red-500/30 hover:to-red-600/30 hover:border-red-400/50 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-red-500/20"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {apiError && (
          <div
            className="bg-gradient-to-r from-red-500/15 to-red-600/15 backdrop-blur-md border border-red-400/40 text-white rounded-xl px-5 py-4 mb-6 shadow-lg"
            role="alert"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-5 h-5 mt-0.5 bg-red-500/80 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-200">{apiError}</p>
                </div>
              </div>
              <button
                className="text-red-300 hover:text-red-100 transition-colors flex-shrink-0"
                onClick={() => setApiError("")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div
            className="bg-gradient-to-r from-emerald-500/15 to-green-500/15 backdrop-blur-md border border-emerald-400/40 text-white rounded-xl px-5 py-4 mb-6 shadow-lg"
            role="alert"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-5 h-5 mt-0.5 bg-emerald-500/80 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-200">
                    {successMessage}
                  </p>
                </div>
              </div>
              <button
                className="text-emerald-300 hover:text-emerald-100 transition-colors flex-shrink-0"
                onClick={() => setSuccessMessage("")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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

        {/* Add User Form */}
        <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <svg
                className="w-5 h-5 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {form.id_usr ? "Edit User Account" : "Add New User Account"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {form.id_usr
                  ? "Update the user details below"
                  : "Fill in the user details below"}
              </p>
            </div>
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* First Row: Station, Full Name, Username */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Station */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Station <span className="text-red-400">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-700/40 border border-slate-600/40 rounded-xl text-white focus:outline-none focus:border-cyan-500/60 focus:bg-slate-700/60 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 appearance-none cursor-pointer"
                  value={form.id_sts}
                  onChange={(e) =>
                    setForm({ ...form, id_sts: parseInt(e.target.value) })
                  }
                  style={{ color: form.id_sts ? "white" : "#64748b" }}
                >
                  <option value={0} disabled hidden className="text-gray-400">
                    Select Station
                  </option>
                  {stations.map((station) => (
                    <option
                      key={station.id_sts}
                      value={station.id_sts}
                      className="text-black bg-white"
                    >
                      {station.code_station}
                    </option>
                  ))}
                </select>
                {error.id_sts && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error.id_sts}</span>
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Full Name"
                  className="w-full px-4 py-2.5 bg-slate-700/40 border border-slate-600/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-slate-700/60 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  value={form.fullname}
                  onChange={(e) =>
                    setForm({ ...form, fullname: e.target.value })
                  }
                />
                {error.fullname && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error.fullname}</span>
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Username"
                  className="w-full px-4 py-2.5 bg-slate-700/40 border border-slate-600/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-slate-700/60 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
                {error.username && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error.username}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Second Row: Password, Email, Phone Number */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Password */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      form.id_usr
                        ? "Leave blank to keep current password"
                        : "Enter Password"
                    }
                    className="w-full px-4 py-2.5 pr-12 bg-slate-700/40 border border-slate-600/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-slate-700/60 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200 focus:outline-none"
                    tabIndex={-1}
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      className="w-4 h-4"
                    />
                  </button>
                </div>
                {error.password && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error.password}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full px-4 py-2.5 bg-slate-700/40 border border-slate-600/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-slate-700/60 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {error.email && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error.email}</span>
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter Phone Number"
                  className="w-full px-4 py-2.5 bg-slate-700/40 border border-slate-600/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-slate-700/60 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  value={form.nohp}
                  onChange={(e) => setForm({ ...form, nohp: e.target.value })}
                />
                {error.nohp && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error.nohp}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Third Row: Status */}
            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-700/40 border border-slate-600/40 rounded-xl text-white focus:outline-none focus:border-cyan-500/60 focus:bg-slate-700/60 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 appearance-none cursor-pointer"
                  value={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: parseInt(e.target.value) })
                  }
                >
                  <option value={1} className="text-black bg-white">
                    Active
                  </option>
                  <option value={0} className="text-black bg-white">
                    Inactive
                  </option>
                </select>
                {error.is_active && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error.is_active}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-2 pt-5 border-t border-white/10">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400/60 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-cyan-500/20"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {form.id_usr ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  )}
                </svg>
                {form.id_usr ? "Update User" : "Add User"}
              </button>
            </div>
          </form>
        </div>

        {/* User Data Table */}
        <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">User Accounts</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {users.length} total users
              </p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-max">
              <thead>
                <tr>
                  <th className="text-left py-4 px-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    No
                  </th>
                  <th className="text-left py-4 px-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="text-left py-4 px-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Station
                  </th>
                  <th className="text-left py-4 px-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="text-left py-4 px-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left py-4 px-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="text-left py-4 px-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center py-4 px-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user, idx) => (
                    <tr
                      key={user.id_usr}
                      className="hover:bg-slate-700/20 transition-colors duration-150"
                    >
                      <td className="py-4 px-3 text-slate-400 text-sm">
                        {(currentPage - 1) * ITEM_PER_PAGE + idx + 1}
                      </td>
                      <td className="py-4 px-3">
                        <div className="font-semibold text-cyan-300 text-sm">
                          {user.fullname}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-white font-medium text-sm">
                          {stations.find(
                            (station) => station.id_sts === user.id_sts
                          )?.code_station || user.id_sts}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-slate-200 text-sm">
                          {user.username}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-slate-200 text-sm">
                          {user.email}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-slate-300 text-sm">
                          {user.nohp}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${
                            user.is_active === 1
                              ? "bg-green-500/15 text-green-300 border-green-500/30"
                              : "bg-red-500/15 text-red-300 border-red-500/30"
                          }`}
                        >
                          {user.is_active === 1 ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(user)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 hover:border-blue-400/50 transition-all duration-150"
                            title="Edit"
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="w-3 h-3"
                            />
                          </button>

                          <button
                            onClick={() => handleActivate(user.id_usr)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 hover:border-green-400/50 transition-all duration-150"
                            title="Activate"
                          >
                            <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(user.id_usr)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-500/15 text-slate-400 border border-slate-500/30 hover:bg-slate-500/25 hover:border-slate-400/50 transition-all duration-150"
                            title="Deactivate"
                          >
                            <FontAwesomeIcon
                              icon={faEyeSlash}
                              className="w-3 h-3"
                            />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id_usr)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:border-red-400/50 transition-all duration-150"
                            title="Delete"
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="w-3 h-3"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 px-4">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 mb-4 rounded-full bg-slate-700/30 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">
                          No user data available
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          Add a new user to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-5 pt-5 border-t border-white/10 gap-4">
            <div className="text-xs text-slate-400 font-medium">
              {users.length > 0 ? (
                <>
                  Showing{" "}
                  <span className="text-white">
                    {(currentPage - 1) * ITEM_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-white">
                    {Math.min(currentPage * ITEM_PER_PAGE, users.length)}
                  </span>{" "}
                  of <span className="text-white">{users.length}</span> entries
                </>
              ) : (
                <>No entries to display</>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/40 border border-slate-600/40 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700/60 hover:border-slate-500/50 transition-all duration-150"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {users.length === 0 ? (
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold">
                    1
                  </button>
                ) : (
                  Array.from(
                    { length: Math.max(1, Math.min(5, totalPages)) },
                    (_, i) => {
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
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-150 ${
                            currentPage === pageNumber
                              ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                              : "bg-slate-700/40 border border-slate-600/40 text-slate-400 hover:bg-slate-700/60 hover:border-slate-500/50 hover:text-slate-300"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                  )
                )}
              </div>

              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages || 1, currentPage + 1))
                }
                disabled={currentPage === (totalPages || 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/40 border border-slate-600/40 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700/60 hover:border-slate-500/50 transition-all duration-150"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
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
