import { Routes, Route, NavLink } from "react-router-dom";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import Relations from "./pages/Relations";
import Import from "./pages/Import";
import './App.css'

function App() {
 

  return (
    <>
     <nav className="navbar">
      <NavLink to="/invoices" className={({ isActive }) => (isActive ? "active" : "")}>Invoices</NavLink>
      <NavLink to="/invform" className={({ isActive }) => (isActive ? "active" : "")}>InvoiceForm</NavLink>
      <NavLink to="/relations" className={({ isActive }) => (isActive ? "active" : "")}>Relations</NavLink>
      <NavLink to="/import" className={({ isActive }) => (isActive ? "active" : "")}>Import</NavLink>
     </nav>

    <main className="content">
      <Routes>
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invform" element={<InvoiceForm />} />
        <Route path="/relations" element={<Relations />} />
        <Route path="/import" element={<Import />} />
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
