import React, { useState} from 'react'
import axios from 'axios';
import "./Statements.css"

function Statements() {
  const [stats, setStats] = useState([])


  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5001/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // set to true if you’re using cookies/auth
      });

      if (res.data.success) {
        setStats(res.data.data);   // 🎯 update React state
        console.log("Loaded data:", res.data.data);
      } else {
        console.error("Upload failed:", res.data.error);
      }
    } catch (err) {
      console.error("Axios error:", err);
    }
  };

  function subtractDays(dateStr, days) {
  // dateStr is yyyy-mm-dd
  const date = new Date(dateStr);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10); // back to yyyy-mm-dd
}

  const Process = async () => {
    
    for (const rec of stats) {
     if (rec.Omschrijving.includes("Kosten")) continue;
     if (rec.Omzetnummer === 0) continue;
     if (rec.Omzetnummer !=7 && rec.Omzetnummer !=8) continue;
     const [part1 = "",part2 = "",part3 = ""] = rec.Omschrijving.split("***") 
      console.log(rec.Omzetnummer+";"+rec.Boekingsdatum+";"+rec.Bedrag+";"+part2.trim());
       const [dd,mm,yyyy] = rec.Boekingsdatum.split("/");
       const till = yyyy + "-" + mm.padStart(2,"0") + "-" + dd.padStart(2,"0");
       const from = subtractDays(till, 50);
       const response = await axios.post("http://localhost:5001/realm-invoices", { 
        journal: "11",
        from: from,
        till: till 
      });
      const data = response.data;
      console.log("invoices",data);
    }
  }

  return (
    <div>
    <input type="file" onChange={handleUpload} />
    {/* Display stats in a table

     */}
   <table className="invoice-table">
  <thead>
    <tr>
      <th>Nummer</th>
      <th>Datum</th>
      <th>Bedrag</th>
      <th>Omschrijving</th>
    </tr>
  </thead>
  <tbody>
    {stats.map((row, i) => (
      <tr key={i}>
        <td>{row["Omzetnummer"]}</td>
        <td>{row["Boekingsdatum"]}</td>
        <td>{row["Bedrag"]}</td>
        <td>{row["Omschrijving"]}</td>
      </tr>
    ))}
  </tbody>
</table>
    <button onClick={Process}>Verwerk</button>
    
     </div>
  );
}

export default Statements