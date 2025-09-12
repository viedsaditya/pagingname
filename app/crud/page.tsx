"use client";
import { useEffect, useState } from "react";
import { addPaging, deletePaging, getPagings, updatePaging } from "../utils/api";
//tambahkan dua import baru untuk impelementasi authentication
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const Home = () => {
  //tambahan fitur untuk pagination
  const ITEM_PER_PAGE = 10; //jumlah data per halaman
  const [currentPage, setCurrentPage] = useState(1); //halaman saat ini
  const [totalPages, setTotalPages] = useState(1); //total halaman

  // tambahkan variable router
  const router = useRouter();

  //=============VIEW DATA
  //siapkan variable state yang dibutuhkan
  const [pagings, setPagings] = useState<any[]>([]);
  const [form, setForm] = useState({
    id: 0,
    belt_no: "",
    flight_no: "",
    name_passenger: "",
  });

  //siapkan state untuk menangani error validasi form
  const [error, setError] = useState({
    belt_no: "",
    flight_no: "",
    name_passenger: "",
  });
  
  //state untuk menangani error dari API
  const [apiError, setApiError] = useState("");

  //siapkan function untuk validasi form
  const validateForm = () => {
    const newErrors = {
      belt_no: "",
      flight_no: "",
      name_passenger: "",
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
    
    // Check for duplicate belt number in the client side (optional, server will also check)
    const duplicateBelt = pagings.find(
      p => p.belt_no === form.belt_no && p.id !== form.id
    );
    
    if (duplicateBelt) {
      // Only show the yellow alert style message with a gentler wording
      setApiError(`Belt number ${form.belt_no} is already in use. Please choose another belt number.`);
      return false; // Prevent form submission
    }
    
    //kumpulkan error ke state
    setError(newErrors);
    return !Object.values(newErrors).some((error) => error);
  }
  
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
  const handlePageChange = (newPage:number)=>{
    //jika halaman sudah mentok tombol next atau previous tidak bisa diklik
    if(newPage >= 1 && newPage > totalPages) return; 
    setCurrentPage(newPage);
  };
  
  //method untuk memecah data yang akan ditampilkan per 10 records
  const paginatedPagings = pagings.slice(
    (currentPage - 1) * ITEM_PER_PAGE,
    currentPage * ITEM_PER_PAGE
  );

  //panggil method fetchPagings secara background
  useEffect(() => {
  //   //pastikan data employees muncul jika user sudah login
  //   const loggedIn = Cookies.get("logged_in");
  //   //jika user belum login redirect ke halaman login
  //   if (!loggedIn) {
  //     router.push("/login");
  //   } else { //jika user sudah login maka tampilkan data employee
      fetchPagings();
  //   }
  }, []);

  //=============UPDATE DATA
  //function untuk populate data ke form jika button edit diklik
  const handleEdit = (paging: any) => {
    setForm(paging);
  }

  //=============DELETE DATA
  //function untuk menghapus data jika button delete diklik
  const handleDelete = async(id: number) => {
    const confirmation = window.confirm("Are you sure you want to delete this data?");
    if (confirmation) {
      try {
        await deletePaging(id);
        //refresh data pada table
        fetchPagings();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Sorry, the data cannot be deleted";
        setApiError(errorMessage);
      }
    }
  }

  //=============BUTTON SUBMIT
  //function yang akan dipanggil ketika button submit diklik
  const handleSubmit = async() => {
    //jangan lupa validsi form 
    if (!validateForm()) return;
    
    // Clear any previous API errors
    setApiError("");

    try {
      //jika id ada maka update data
      if (form.id) {
        await updatePaging(form);
      } else { // jika id tidak ada maka insert data
        await addPaging(form);
      }
      //setelah selesai kosongkan form
      setForm({ id: 0, belt_no: "", flight_no: "", name_passenger: "" });
      //refresh data pada table
      fetchPagings();
    } catch (err: unknown) {
      // Set friendly message to display to user
      const errorMessage = err instanceof Error ? err.message : "Sorry, the data cannot be saved";
      setApiError(errorMessage);
      console.error("API Response Issue:", err);
    }
  }

  //=============LOGOUT
  //function akan dipanggil ketika button logout diklik
  const handleLogout = () => {
    //hapus cookie dan redirect ke halaman login
    Cookies.remove("logged_in");
    router.push("/login");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Paging Management</h1>
      <button                  
          className="bg-blue-500 text-white px-2 py-1 rounded mb-2"
          onClick={() => handleLogout()}
      >
          Logout
      </button>
      
      {/* Display notification messages */}
      {apiError && (
        <div className="bg-yellow-100 border border-yellow-500 text-yellow-800 animate-pulse px-4 py-3 rounded mb-4 relative" role="alert">
          <strong className="font-bold">
            Warning:
          </strong>
          <span className="block sm:inline ml-2">
            {apiError}
          </span>
          <span 
            className="absolute top-0 bottom-0 right-0 px-4 py-3" 
            onClick={() => setApiError("")}
          >
            <svg className="fill-current h-6 w-6 text-yellow-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
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
      
      <form
        className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 bg-gray text-black" 
        onSubmit={(e)=>{
          //mencegah form berpindah ke halaman lain ketika di submit
          e.preventDefault();
          handleSubmit();
        }}       
      >
        <input
          type="text"
          placeholder="Belt No"          
          className="border p-2 rounded"
          value={form.belt_no} onChange={(e) => setForm({...form, belt_no: e.target.value})}
        />
        {error.belt_no && <p className="text-red-500">{error.belt_no}</p>}
        <input
          type="text"
          placeholder="Flight No"          
          className="border p-2 rounded"
          value={form.flight_no} onChange={(e) => setForm({...form, flight_no: e.target.value})}
        />
        {error.flight_no && <p className="text-red-500">{error.flight_no}</p>}
        <input
          type="text"
          placeholder="Name Passenger"          
          className="border p-2 rounded"
          value={form.name_passenger} onChange={(e) => setForm({...form, name_passenger: e.target.value})}
        />
        {error.name_passenger && <p className="text-red-500">{error.name_passenger}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {form.id ? "Update" : "Add"} Paging
        </button>
      </form>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Belt No</th>
            <th className="border p-2">Flight No</th>
            <th className="border p-2">Name Passenger</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
              {paginatedPagings.map((pag) => (  
                  <tr key={pag.id}>
                      <td className="border p-2">{pag.id}</td>
                      <td className="border p-2">{pag.belt_no}</td>
                      <td className="border p-2">{pag.flight_no}</td>
                      <td className="border p-2">{pag.name_passenger}</td>
                      <td className="border p-2">
                      <button                  
                          className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                          onClick={() => handleEdit(pag)} 
                      >
                          Edit
                      </button>
                      <button                  
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => handleDelete(pag.id)} 
                      >
                          Delete
                      </button>
                      </td>
                  </tr>
              ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          className={`bg-blue-500 text-white px-2 py-1 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : ""}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} from {totalPages}</span>
        <button
          className={`bg-blue-500 text-white px-2 py-1 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : ""}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
  
export default Home;