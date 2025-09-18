"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const LoginPage = () => {  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("https://belajaroracle.com/api/hrapi/users/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({USERNAME:username, PASSWORD:password}),
      });  

      const data = await response.json();

      if(data.logged_in === "1") {
        //jika berhasil login maka buat cookie dan redirect ke halaman crud
        Cookies.set("logged_in", "1", { expires: 1 });
        router.push("/crud");
      } else { // error ketika salah username atau password
        setError("Username atau Password Anda Salah");
      }

    } catch (error) {
      setError("Ada kesalah ketika login");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-black">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        {error &&<p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">Username</label>
            <input
              type="text"
              id="username" 
              onChange={(e) => setUsername(e.target.value)}    
              value={username}         
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <input
              type="password"
              id="password" 
              onChange={(e) => setPassword(e.target.value)}        
              value={password}     
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
  
export default LoginPage;