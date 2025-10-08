import React , { useState, useEffect } from 'react'
import CustomButton from '../ui/CustomButton';
import axios from 'axios';
import './Relations.css';


const api = axios.create()

// --- interceptors
api.interceptors.request.use((config) => {
  console.log("[Server Request]", config);
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log("[Response]", res);
    return res;
  },
  (err) => {
    console.error("[Error]", err);
    return Promise.reject(err);
  }
);
// end interceptors

export default function Relations() {
    const [relarray, setRelarray] = useState([])
    const [relations, setRelations] = useState([]);
    const [search, setSearch] = useState("");

     // Fetch from backend
  useEffect(() => {
    const getRelations = async () => {
      try {
        const response = await axios.get("http://localhost:5001/realm-relations");
        setRelations(response.data); // expect array of relations
        //console.log("Fetched relations:", response.data);
      } catch (err) {
        console.error("Failed to fetch relations:", err.message);
      }
    };

    getRelations();
  }, []);

  const filtered = relations.filter((rel) =>
    rel.name.toLowerCase().includes(search.toLowerCase())
  );
    

    const fetchRelations = async () => {
        try {
        const response = await axios.get("http://localhost:5001/octo-relations");
        const data = response.data;   // axios puts parsed JSON here
        console.log("data",data);
        setRelarray(data);
        } catch (err) {
  console.error("Request failed:", err.message);
}
    }
    const procRelations = async () => {
        if (relarray.length === 0) {
            console.log("No relations to process. Please fetch relations first.");
            return;
        }
        for (const rel of relarray) {
            console.log("RelName:", rel.name, rel.ibanAccountNr)
            const relid = rel.relationIdentificationServiceData.relationKey.id;
            
            const response = await axios.post("http://localhost:5001/realm-addrelation", {
                id: relid,
                name: rel.name,
                streetandnr: rel.streetAndNr,
                postalcode: rel.postalCode,
                city: rel.city,
                country: rel.country,
                phone: rel.telephone,
                email: rel.email,
                vatnumber: rel.vatNr,
                client: rel.client,
                supplier: rel.supplier,
                iban: rel.ibanAccountNr

            });
            console.log(response.data);
           
        };
    }

 return (
    <div className="relations-container">
       {/* Controls */}
      <div className="relations-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search relations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="relations-buttons">
          <button className="btn" onClick={fetchRelations}>Fetch</button>
          <button className="btn" onClick={procRelations}>Process</button>
        </div>
      </div>

      {/* Table */}
      <div className="relations-table-wrapper">
        <table className="relations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Postal Code</th>
              <th>City</th>
              <th>Client</th>
              <th>Supplier</th>
              <th>IBAN</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rel) => (
              <tr key={rel.id}>
                <td>{rel.id}</td>
                <td>{rel.name}</td>
                <td>{rel.postalcode}</td>
                <td>{rel.city}</td>
                <td>{rel.client ? "✔" : ""}</td>
                <td>{rel.supplier ? "✔" : ""}</td>
                <td>{rel.iban}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
    
   
   
}
