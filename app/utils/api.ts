//ini adalah libary untuk berurusan dengan API
// Function to get base URL
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client side
    return window.location.origin;
  }
  // Server side
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

const API_URL = "/api/paging";
const USER_API_URL = "/api/users";
const STATION_API_URL = "/api/stations";
const FLIGHTNOS_API_URL = "/api/flightnos";

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

//Define interface for user data
interface UserData {
  id_usr?: number;
  id_sts: number;
  fullname: string;
  username: string;
  password: string;
  email: string;
  nohp: string;
  is_active: number;
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

// ========= USER API FUNCTIONS =========

//function untuk mengambil semua data user
export const getUsers=async()=> {
    const apiUrl = typeof window !== 'undefined' ? USER_API_URL : `${getBaseURL()}${USER_API_URL}`;
    const response = await fetch(apiUrl,{headers: defaultHeaders});
    if (!response.ok) {
        throw new Error(`Error accessing User API: ${response.status}`);
    }
    return response.json();
}

//function untuk menambah data user
export const addUser=async(user: UserData) => {
    const apiUrl = typeof window !== 'undefined' ? USER_API_URL : `${getBaseURL()}${USER_API_URL}`;
    console.log("addUser called with:", user);
    console.log("API URL:", apiUrl);
    console.log("Headers:", defaultHeaders);
    
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(user),
    });
    
    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`Error accessing User API: ${response.status}`);
    }
    return response.json();
}

//function untuk mengupdate data user
export const updateUser=async(user: UserData) => {
    const apiUrl = typeof window !== 'undefined' ? USER_API_URL : `${getBaseURL()}${USER_API_URL}`;
    const response = await fetch(apiUrl, {
        method: "PUT",
        headers: defaultHeaders,
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error(`Error accessing User API: ${response.status}`);
    }
    return response.json();
}

//function untuk menghapus data user
export const deleteUser=async(id_usr: number) => {
    const apiUrl = typeof window !== 'undefined' ? USER_API_URL : `${getBaseURL()}${USER_API_URL}`;
    const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: defaultHeaders,
        body: JSON.stringify({id_usr}),
    });
    if (!response.ok) {
        throw new Error(`Error accessing User API: ${response.status}`);
    }
    return response.json();
}

// ========= STATION API FUNCTIONS =========

//function untuk mengambil semua data station
export const getStations=async()=> {
    const apiUrl = typeof window !== 'undefined' ? STATION_API_URL : `${getBaseURL()}${STATION_API_URL}`;
    const response = await fetch(apiUrl,{headers: defaultHeaders});
    if (!response.ok) {
        throw new Error(`Error accessing Station API: ${response.status}`);
    }
    return response.json();
}

// ======== FLIGHT NO LOOKUP ========
export const getFlightNos = async (params?: {
  station?: string;
  start_date?: string; // YYYY-MM-DD
  to_date?: string; // YYYY-MM-DD
  source?: string;
}) => {
  const apiUrlBase = typeof window !== 'undefined' ? FLIGHTNOS_API_URL : `${getBaseURL()}${FLIGHTNOS_API_URL}`;
  const url = new URL(apiUrlBase, getBaseURL());
  if (params?.station) url.searchParams.set('station', params.station);
  if (params?.start_date) url.searchParams.set('start_date', params.start_date);
  if (params?.to_date) url.searchParams.set('to_date', params.to_date);
  if (params?.source) url.searchParams.set('source', params.source);

  const response = await fetch(typeof window !== 'undefined' ? `${FLIGHTNOS_API_URL}${url.search}` : url.toString(), {
    headers: defaultHeaders,
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Error accessing FlightNos API: ${response.status}`);
  }
  return response.json();
}