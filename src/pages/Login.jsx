import { useState } from "react";
import { useNavigate } from "react-router-dom";
//import { setAuthed } from "./authStore.js";
import { FaUser, FaLock } from "react-icons/fa";
import "./Login.css";
import { Toaster, toast } from "sonner";
import axios from "axios";


export default function Login({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [action, setAction] = useState("signin");
  const nav = useNavigate();

  async function handleLogin(e) {
  e.preventDefault();

  try {
    const endpoint =
      action === "signin"
        ? "http://localhost:5001/signin"
        : "http://localhost:5001/signup";

    console.log("endpoint", endpoint);

    const res = await axios.post(endpoint, {
      email,
      password,
    }, { withCredentials: true });

    console.log("res", res);
    if (res.status === 200 || res.status === 201) {
      if (action === "signin") {
        toast("Signin success!", { type: "success" });
      }
      if (action === "signup") {
        toast("Signup success! " + res.email, { type: "success" });
      }
      const me = await axios.get("http://localhost:5001/me", {
        withCredentials: true,
      });
      setAuth({ loading: false, user: me.data.user });
      nav("/invoices");
    }
     // setAuthed(true);

  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Login error", err.response?.status, err.response?.data);
      if (err.response?.status === 401) {
        toast("Invalid credentials");
      } else {
        toast("Unexpected error: " + (err.response?.data?.error || err.message));
      }
    } else {
      console.error(err);
      alert("Something went wrong");
    }
  }
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
       <button  onClick={() => {
         setAction("signup");
         handleLogin()
         }} // call submit manually
        className="submit-button">Sign Up</button>
       <Toaster richColors position="top-center" offset={100}/>
      </form>
    </div>
  );
}
