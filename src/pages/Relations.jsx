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
            //console.log("RelName:", rel.name)
            const relid = rel.relationIdentificationServiceData.relationKey.id;
            
            const response = await axios.post("http://localhost:5001/octo-addrelation", {
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
                supplier: rel.supplier  

            });
            console.log(response.data);
           
        };
    }

 
    return (
    <div className="relations-container">
      {/* Search input */}
      <input
        type="text"
        className="search-input"
        placeholder="Search relations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* List */}
      <ul className="relations-list">
        {filtered.map((rel) => (
          <li key={rel.id} className="relation-item">
            <strong>{rel.name}</strong> — {rel.city}, {rel.country}
          </li>
        ))}
      </ul>

      {/* Button row */}
      <div className="button-row">
        <CustomButton onClick={fetchRelations}>Fetch Relations</CustomButton>
     <CustomButton onClick={procRelations}>Proc Relations</CustomButton>
      </div>
    </div>
  );
    
   
   
}
