import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import Relations from "./pages/Relations";
import Import from "./pages/Import";
import Login from "./pages/Login";
import Statements from "./pages/Statements";
import { useState, useEffect } from "react";
import './App.css'
import axios from "axios";



axios.defaults.withCredentials = true;

function App() {
  const [auth, setAuth] = useState({ loading: true, user: null });
  const navigate = useNavigate();

   useEffect(() => {
    async function checkSession() {
      try {
        const res = await axios.get("http://localhost:5001/me", {
          withCredentials: true,
        });
        setAuth({ loading: false, user: res.data.user });
      } catch {
        setAuth({ loading: false, user: null });
      }
    }
    checkSession();
  }, []);

   const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5001/logout", {}, { withCredentials: true });
    } catch (e) {
      console.error("logout failed", e);
    } finally {
      setAuth({ loading: false, user: null });  // clear auth state
      navigate("/");  
                                // go back to login
    }
  };

  if (auth.loading) return <p>Loading...</p>;

  return (
    <>
     <nav className="navbar">

      <NavLink to="/invoices" className={({ isActive }) => (isActive ? "active" : "")}>Invoices</NavLink>
      <NavLink to="/invform" className={({ isActive }) => (isActive ? "active" : "")}>InvoiceForm</NavLink>
      <NavLink to="/relations" className={({ isActive }) => (isActive ? "active" : "")}>Relations</NavLink>
      <NavLink to="/import" className={({ isActive }) => (isActive ? "active" : "")}>Import</NavLink>
      <NavLink to="/statements" className={({ isActive }) => (isActive ? "active" : "")}>Statements</NavLink>
      {auth.user && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
     </nav>

    <main className="content">
      <Routes>
         <Route path="/" element={<Login setAuth={setAuth}/>} />
        <Route path="/invoices" element={
          auth.user ? <Invoices /> : <Navigate to="/" replace />
        } />
        <Route path="/invform" element={<InvoiceForm />} />
        <Route path="/relations" element={<Relations />} />
        <Route path="/import" element={<Import />} />
         <Route path="/statements" element={<Statements />} />
        {/* fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </main>
      </>
    
  )

  function NotFound() {
    return <h2>Page not found</h2>; 
}
}

export default App;
