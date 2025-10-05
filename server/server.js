import Realm from "realm";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import axios from "axios";
import { addRelation,  addInvoice, getRelationsRealm, getInvoicesRealm, getUsersRealm } from "./realmHelper.js";
import { realmToJson } from "./utils/realmToJson.js";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";


// fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// always load env from the server folder
dotenv.config({ path: path.join(__dirname, ".env") });


//dotenv.config(); 
//nodemon server.js --ignore '*.realm*' --ignore '*.note' --ignore '*.lock'

const app = express();
console.log("PDF path:", process.env.PDF_UPLOAD_PATH);

app.use("/pdfs", express.static(path.resolve(process.env.PDF_UPLOAD_PATH)));


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
app.use(cors({ origin: "http://localhost:5173" }));

// 📝 Logging: dev-friendly logs
app.use(morgan("dev"));

// 📦 Parse JSON request body
app.use(express.json());

app.use(cookieParser())

// Example route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from secure server 👋" });

});

const JWT_SECRET = process.env.JWT_SECRET || "change_me";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

function authMiddleware(req, res, next) {
  const token = req.cookies["access_token"];
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

async function getAuth() {
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
        return token;
}

async function getToken(auth) {
  const url = process.env.URL + "/dossiers";
  const response = await axios.post(url, null, {
      params: { dossierId: process.env.DOS_NR }, // query parameters
      headers: {
        token: auth,
        "Content-Type": "application/json",
      },
    });
    const dostok = response.data.Dossiertoken;
    store.set("dossiertoken", dostok);
    console.log("DosToken stored:", dostok);
    store.set("dossiertime", Date.now());
    return dostok;
}

app.get("/octo-auth", async (req, res) => { 
    try {
        const auth = await getAuth();
        res.json({ auth });
    } catch (error) { 
        res.status(500).json({ error: error.message });
    }
});

app.get("/octo-token", async (req, res) => {
 
  try {
    const auth = await getAuth();            // auth step
    const token = await getToken(auth);      // token step
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
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


app.post("/octo-bookm", async (req, res) => {
  const { by, jt, dm } = req.body
  console.log("Received parameters:", { by, jt, dm });
  const url =
    process.env.URL +
    "/dossiers/" +
    process.env.DOS_NR +
    "/bookyears/" +
    by +
    "/bookings/modified";
  const auth = await getAuth();  
  const dossiertoken = await getToken(auth);  
  
  try {
    const response = await axios.get(url, {
      params: { journalTypeId: jt, modifiedTimeStamp: dm },
      headers: {
        dossierToken: dossiertoken,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
    // store.set("dostoken", response);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.get("/octo-relations", async (req, res) => {
  const url = process.env.URL + "/dossiers/" + process.env.DOS_NR + "/relations";
  
  try {
    const auth = await getAuth();  
    const dossiertoken = await getToken(auth);  
    const response = await axios.get(url, {
      headers: {
        dossierToken: dossiertoken,
        "Content-Type": "application/json",
      },
    });
    console.log("Relations fetched:", response.data);
    res.json(response.data);
    // store.set("dostoken", response);
  } catch (err) {
    res.status(500).json({ error: "API request failed" });
  }
});

app.post("/realm-addrelation", async (req, res) => {
  const relationData = req.body; // Expecting relation data in request body
  console.log("Adding relation:", relationData);
  try {
    const id = await addRelation(relationData);
    res.json({ message: "Relation added/updated", id });
  } catch (err) {
    res.status(500).json({ error: "Failed to add/update relation" });
  }   
})

app.get("/realm-relations", authMiddleware, async (req, res) => {
  // Fetch all relations from Realm DB
  try {
    const realmr = await getRelationsRealm();
    const allRelations = realmr.objects("Relations");
    res.json(realmToJson(allRelations));
  } catch (err) {
    console.error("Realm fetch error:", err);
    res.status(500).json({ error: "Failed to fetch relations from Realm" });
  }
})

app.post("/realm-addinvoice", async (req, res) => {
  const invoiceData = req.body; // Expecting relation data in request body
  console.log("Adding invoice:", invoiceData);
  try {
    const id = await addInvoice(invoiceData);
    res.json({ message: "Invoice added/updated", id });
  } catch (err) {
    res.status(500).json({ error: "Failed to add/update invoice" });
  }   
})

app.post("/realm-invoices", async (req, res) => {
  // Fetch all invoices from Realm DB
  try {
    const { journal, from, till } = req.body;
    const realmi = await getInvoicesRealm();
    const allInvoices = realmi.objects("Invoices").filtered('journal == $0 AND period >= $1 AND period <= $2', journal, from, till) //.sorted([['period', false], ['documentnr', false]] );
    res.json(realmToJson(allInvoices));
  } catch (err) {
    console.error("Realm fetch error:", err);
    res.status(500).json({ error: "Failed to fetch invoices from Realm" });
  }
})

// server.js denk niet gebruikt
app.post("/invoices/upsert", async (req, res) => {
  try {
    const payload = req.body;

    // open realms
    const relationsRealm = await getRelationsRealm();
    const invoicesRealm  = await getInvoicesRealm();

    // find linked relation by primary key (id)
    const relation = relationsRealm.objectForPrimaryKey("Relations", parseInt(payload.relationId, 10));
    if (!relation) return res.status(400).json({ error: "Relation not found" });

    // build invoice object for realm
    const invoice = {
      id: payload.id,
      period: payload.period,
      journaltype: payload.journaltype,
      journalnr: payload.journalnr,
      documentnr: payload.documentnr,
      relation, // 👈 direct link object
      amount: payload.amount,
      taxamount: payload.taxamount,
      totalamount: payload.totalamount,
      date: payload.date,
      duedate: payload.duedate,
      paid: !!payload.paid,
      paymentreference: payload.paymentreference || null,
      comment: payload.comment || null,
      pdf: payload.pdf || null,
    };

    invoicesRealm.write(() => {
      invoicesRealm.create("Invoices", invoice, Realm.UpdateMode.Modified);
    });

    res.json({ ok: true, id: invoice.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to upsert invoice" });
  }
});

app.post("/move-file", (req, res) => {
  const { pdfname } = req.body;
  const [ bkfol, bkpdf ] = pdfname.split("/")

  const source = process.env.PDF_UPLOAD_PATH + "/" + pdfname;
  const dest = process.env.PDF_UPLOAD_PATH + "/" + bkfol + "/selected/" + bkpdf;
  //console.log(source + "-" + dest);

  if (fs.existsSync(dest)) {
    // File already exists
    return res.send("File already exists");
  }

  if (!fs.existsSync(source)) {
    // File already exists
    return res.send("File already moved or not found");
  }

  fs.move(source, dest, { overwrite: false })
    .then(() => res.send("File moved successfully"))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error moving file");
    });
});



app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const realm = await getUsersRealm();
  const existing = realm.objects("Users").filtered("email == $0", email);
  if (existing.length > 0) return res.status(409).json({ error: "Email exists" });

  const hash = await bcrypt.hash(password, 12);
  let user;
  realm.write(() => {
    user = realm.create("Users", { id: uuid(), email, passwordHash: hash, createdAt: new Date() });
  });

  res.status(201).json({ id: user.id, email: user.email });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const realm = getUsersRealm();
  const user = realm.objects("Users").filtered("email == $0", email)[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: user.id, email: user.email });
  res.cookie("access_token", token, { httpOnly: true, sameSite: "lax" });
  res.json({ ok: true });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("access_token");
  res.json({ ok: true });
});