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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-slate-500/10 rounded-full blur-3xl"></div>
      </div>

      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/30">
              <span className="text-2xl font-bold text-blue-300">
                {countdown}
              </span>
            </div>
            <p className="text-white text-lg font-semibold">Logout Successful</p>
            <p className="text-white/70 text-sm mt-1">
              Redirecting to login page...
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto relative z-10">
        {/* Modern Header */}
        <div className="flex-1 bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-700/40 border border-white/10 overflow-hidden">
                <Image
                  src="/logojasaja.png"
                  alt="JAS"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  JAS User Management
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLogout()}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200 text-sm font-medium"
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
        </div>

        {/* Error Notification */}
        {apiError && (
          <div
            className="bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-500/20 backdrop-blur-xl border border-red-400/30 text-white rounded-2xl px-6 py-4 mb-6 relative shadow-2xl animate-pulse"
            role="alert"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✕</span>
                </div>
                <div>
                  <strong className="font-bold text-red-200">Error:</strong>
                  <span className="block sm:inline ml-2 text-gray-100">
                    {apiError}
                  </span>
                </div>
              </div>
              <button
                className="text-red-300 hover:text-red-100 transition-colors p-1"
                onClick={() => setApiError("")}
              >
                <svg
                  className="w-6 h-6"
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
            className="bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 text-white rounded-2xl px-6 py-4 mb-6 relative shadow-2xl animate-bounce"
            role="alert"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong className="font-bold text-emerald-200">
                    Success:
                  </strong>
                  <span className="block sm:inline ml-2 text-gray-100">
                    {successMessage}
                  </span>
                </div>
              </div>
              <button
                className="text-emerald-300 hover:text-emerald-100 transition-colors p-1"
                onClick={() => setSuccessMessage("")}
              >
                <svg
                  className="w-6 h-6"
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

        {/* Add Paging Form */}
        <div className="flex-1 bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/40 border border-white/10">
              ✏️
            </span>
            <h3 className="text-xl font-bold text-white">
              {form.id_usr ? "Edit User" : "Add New User"}
            </h3>
          </div>

          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Row 1: Station, Full Name, Username */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Station */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Station
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 
                 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 
                 focus:bg-slate-700/50 transition-all duration-200 appearance-none"
                  value={form.id_sts}
                  onChange={(e) =>
                    setForm({ ...form, id_sts: parseInt(e.target.value) })
                  }
                  style={{ color: form.id_sts ? "white" : "#9CA3AF" }}
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
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.id_sts}</span>
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Full Name"
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 
                 rounded-lg text-white placeholder-gray-400 focus:outline-none 
                 focus:border-cyan-500/50 focus:bg-slate-700/50 transition-all duration-200"
                  value={form.fullname}
                  onChange={(e) =>
                    setForm({ ...form, fullname: e.target.value })
                  }
                />
                {error.fullname && (
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.fullname}</span>
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter Username"
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 
                 rounded-lg text-white placeholder-gray-400 focus:outline-none 
                 focus:border-cyan-500/50 focus:bg-slate-700/50 transition-all duration-200"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
                {error.username && (
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.username}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Password, Email, Phone Number */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-6">
              {/* Password */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      form.id_usr
                        ? "Leave blank to keep current password"
                        : "Enter Password"
                    }
                    className="w-full px-4 py-3 pr-12 bg-slate-700/30 border border-slate-600/30 
                   rounded-lg text-white placeholder-gray-400 focus:outline-none 
                   focus:border-cyan-500/50 focus:bg-slate-700/50 transition-all duration-200"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none"
                    tabIndex={-1}
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      className="w-5 h-5"
                    />
                  </button>
                </div>
                {error.password && (
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.password}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 
                 rounded-lg text-white placeholder-gray-400 focus:outline-none 
                 focus:border-cyan-500/50 focus:bg-slate-700/50 transition-all duration-200"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {error.email && (
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.email}</span>
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter Phone Number"
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 
                 rounded-lg text-white placeholder-gray-400 focus:outline-none 
                 focus:border-cyan-500/50 focus:bg-slate-700/50 transition-all duration-200"
                  value={form.nohp}
                  onChange={(e) => setForm({ ...form, nohp: e.target.value })}
                />
                {error.nohp && (
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.nohp}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Status */}
            <div className="grid grid-cols-1 gap-6 mt-6">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Status
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 
                 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 
                 focus:bg-slate-700/50 transition-all duration-200 appearance-none"
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
                  <p className="text-xs text-red-400 mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{error.is_active}</span>
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
                {form.id_usr ? "Update User" : "Add User"}
              </button>
            </div>
          </form>
        </div>

        {/* Paging Data Table */}
        <div className="flex-1 bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/40 border border-white/10">
                👨🏻
              </span>
              User Management
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
                    Station
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Full Name
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Username
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Phone Number
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
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id_usr}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="py-4 px-4 text-gray-400">{user.id_usr}</td>
                      <td className="py-4 px-4 text-gray-400">
                        {stations.find((station) => station.id_sts === user.id_sts)?.code_station || user.id_sts}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-cyan-400">
                          {user.fullname}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white font-medium">
                          {user.username}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white font-medium">
                          {user.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-300 text-sm">{user.nohp}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap ${
                            user.is_active === 1
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {user.is_active === 1 ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200 text-xs font-medium"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id_usr)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200 text-xs font-medium"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Delete
                          </button>
                          <button
                            onClick={() => handleActivate(user.id_usr)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors duration-200 text-xs font-medium"
                            title="Activate"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                            Activate
                          </button>
                          <button
                            onClick={() => handleDeactivate(user.id_usr)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30 transition-colors duration-200 text-xs font-medium"
                            title="Deactivate"
                          >
                            <FontAwesomeIcon
                              icon={faEyeSlash}
                              className="mr-1"
                            />
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center">
                      <div className="text-gray-400">
                        No user data available
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
              {users.length > 0 ? (
                <>
                  Showing {(currentPage - 1) * ITEM_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEM_PER_PAGE, users.length)} of{" "}
                  {users.length} entries
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {users.length === 0 ? (
                  <button className="w-8 h-8 flex items-center justify-center rounded-md text-sm bg-slate-700/30 text-white font-medium shadow-sm">
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
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 shadow-sm ${
                            currentPage === pageNumber
                              ? "bg-cyan-700/30 text-white"
                              : "bg-slate-700/30 border border-slate-600/30 text-gray-300 hover:bg-slate-700/50"
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
                className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-700/30 border border-slate-600/30 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
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
