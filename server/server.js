import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const api = axios.create(); // Create an Axios instance

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

const store = new Map(); // In-memory store (replace with DB in production)

// 🛡️ Security: set safe HTTP headers
app.use(helmet());

// 🌍 CORS: allow frontend to access API
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // frontend origin
    credentials: true, // if you need cookies/credentials
  })
);

// 📝 Logging: dev-friendly logs
app.use(morgan("dev"));

// 📦 Parse JSON request body
app.use(express.json());

// Example route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from secure server 👋" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

app.get("/octo-auth", async (req, res) => { 
    try {
        const url = process.env.URL;
        const secret = process.env.SECRET_AUTH;
        const response = await axios.post(
            `${url}/authentication`,
            { user: process.env.USR, password: process.env.PAS},
            {
                headers: {
                    'Content-Type': 'application/json',
                    softwareHouseUuid: process.env.SHI,
                }
            }
        );
        const token = response.data.token;
        store.set("token", token);
        console.log("Token stored:", token);
        res.json(response.data)
       
    } catch (error) {
        console.error("Error in /octo-auth:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/octo-token", async (req, res) => {
  const url = process.env.URL + "/dossiers";
  const token = store.get("token");
  if (!token) {
    return res.status(401).json({ error: "No auth token found. Please authenticate first." });
  }
  try {
    const response = await axios.post(url, null, {
      params: { dossierId: process.env.DOS_NR }, // query parameters
      headers: {
        token: token,
        "Content-Type": "application/json",
      },
    });
    const dostok = response.data.Dossiertoken;
    store.set("dossiertoken", dostok);
    store.set("dossiertime", Date.now());
    res.json(response.data);
    
  } catch (err) {
    res.status(500).json({ error: "API request failed" });
  }
});

app.get("/octo-bookyears", async (req, res) => {
  const url = process.env.URL + "/dossiers/" + process.env.DOS_NR + "/bookyears";
  const dossiertoken = store.get("dossiertoken");
  if (!dossiertoken) {
    return res.status(401).json({ error: "No dossier token found. Please obtain a dossier token first." });
  }
  try {
    const response = await axios.get(url, {
      headers: {
        dossierToken: dossiertoken,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
    // store.set("dostoken", response);
  } catch (err) {
    res.status(500).json({ error: "API request failed" });
  }
});

app.get("/octo-relations", async (req, res) => {
  const url = process.env.URL + "/dossiers/" + process.env.DOS_NR + "/relations";
  const dossiertoken = store.get("dossiertoken");
  if (!dossiertoken) {
    return res.status(401).json({ error: "No dossier token found. Please obtain a dossier token first." });
  }
  try {
    const response = await axios.get(url, {
      headers: {
        dossierToken: dossiertoken,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
    // store.set("dostoken", response);
  } catch (err) {
    res.status(500).json({ error: "API request failed" });
  }
});