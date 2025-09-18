//ini adalah libary untuk berurusan dengan API
const API_URL = "http://localhost:3000/api/paging";

//tambahkan api key
const API_KEY = "rahasia";

//siapkan default headers untuk semua request
export const defaultHeaders = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}

//function untuk mengambil semua data paging
export const getPagings=async()=> {
    const response = await fetch(API_URL,{headers: defaultHeaders});
    if (!response.ok) {
        throw new Error(`Error accessing API: ${response.status}`);
    }
    return response.json();
}

//Define interface for paging data
interface PagingData {
  id?: number;
  belt_no: string;
  flight_no: string;
  name_passenger: string;
  handle_by: string;
  free_text: string;
  status: number;
}

//function untuk menambah data paging
export const addPaging=async(paging: PagingData) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(paging),
    });
    if (!response.ok) {
        throw new Error(`Error accessing API: ${response.status}`);
    }
    return response.json();
}

//function untuk mengupdate data paging
export const updatePaging=async(paging: PagingData) => {
    const response = await fetch(API_URL, {
        method: "PUT",
        headers: defaultHeaders,
        body: JSON.stringify(paging),
    });
    if (!response.ok) {
        throw new Error(`Error accessing API: ${response.status}`);
    }
    return response.json();
}

//function untuk menghapus data paging
export const deletePaging=async(id: number) => {
    const response = await fetch(API_URL, {
        method: "DELETE",
        headers: defaultHeaders,
        body: JSON.stringify({id}),
    });
    if (!response.ok) {
        throw new Error(`Error accessing API: ${response.status}`);
    }
    return response.json();
}