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
  const [pagings, setPagings] = useState([]);
  const [form, setForm] = useState({
    id: 0,
    belt_no: "",
    flight_no: "",
    name_passenger: "",
  });

  //siapkan state untuk menangani error
  const [error, setError] = useState({
    belt_no: "",
    flight_no: "",
    name_passenger: "",
  });

  //siapkan function untuk validasi form
  const validateForm = () => {
    const newErrors = {
      belt_no: "",
      flight_no: "",
      name_passenger: "",
    };
    if (!form.belt_no.trim()) {
      newErrors.belt_no = "Belt No is required";
    }
    if (!form.flight_no.trim()) {
      newErrors.flight_no = "Flight No is required";
    }
    if (!form.name_passenger.trim()) {
      newErrors.name_passenger = "Name Passenger is required";
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
    const konfirmasi = window.confirm("Are you sure delete this data?");
    if (konfirmasi) {
      await deletePaging(id);
      //refresh data pada table
      fetchPagings();
    }
  }

  //=============BUTTON SUBMIT
  //function yang akan dipanggil ketika button submit diklik
  const handleSubmit = async() => {
    //jangan lupa validsi form 
    if (!validateForm()) return;

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