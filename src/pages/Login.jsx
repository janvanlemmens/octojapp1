import { useState } from "react";
import { useNavigate } from "react-router-dom";
//import { setAuthed } from "./authStore.js";
import { FaUser, FaLock } from "react-icons/fa";
import "./Login.css";
import { Toaster, toast } from "sonner";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [action, setAction] = useState("signin");
  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();


  const endpoint = action === "signin" 
    ? "http://localhost:5001/signin" 
    : "http://localhost:5001/signup";


    const res = await axios.post(endpoint, { email : email, password: password });


    console.log("res",res)
    /*
    if (res.ok) {
      setAuthed(true);
      nav("/invoices");
    } else {
      alert("Login failed");
    }
      */
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">Sign In / Up</h2>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

       <button type="submit" onClick={() => setAction("signin")} className="submit-button">Sign In</button>
       <button type="submit" onClick={() => setAction("signup")} className="submit-button">Sign Up</button>
       <Toaster richColors position="top-center" offset={100}/>
      </form>
    </div>
  );
}
