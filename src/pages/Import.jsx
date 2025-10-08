import React , { useState } from 'react'
import axios from 'axios';
import CustomButton from '../ui/CustomButton';
import "./Import.css"


export default function Import() {
    const [ invoices, setInvoices] = useState([])
    const [ journalType, setJournalType] = useState(2) // 1=purchase, 2=sales
    const [bookYear, setBookYear] = useState("");
    const [importDate, setImportDate] = useState("");

    const fetchInvoices = async () => {
      
    try {
        const response = await axios.post("http://localhost:5001/octo-bookm", {
            by: bookYear,
            jt: journalType,
            dm: importDate + " 00:00:00.000"
          });
        const data = response.data;
        setInvoices(data.modifiedBookings)
        console.log("Invoices data:", data.modifiedBookings);
    } catch (err) {
        console.error("Fetch error:", err);
    }
  }

  const procInvoices = async () => {

    const result = processInvoices(invoices);
    console.log("invoices",invoices)
    console.log(result);

    for (const res of result) {
        console.log("Processing invoice:", res);
        try {
          const response = await axios.post("http://localhost:5001/realm-addinvoice",res)
          console.log(response.data)
        } catch (error) {
          console.error("Error adding invoice:", error);
        }   
    }

  }

  function processInvoices(invoices) {
  const grouped = {};
  const generalAccount = journalType === 1 ? 440000 : 400000; // Purchase or Sales
  const taxAccount = journalType === 1 ? 411000 : 451000; // Purchase or Sales
  for (const line of invoices) {
    // Build a composite key
    const key = `${line.bookyearPeriodeNr}_${line.journalType}${line.journalNr}_${String(line.documentSequenceNr).padStart(3, "0")}`;

    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        period: line.bookyearPeriodeNr,
        journal: `${line.journalType}${line.journalNr}`,
        documentnr: line.documentSequenceNr,
        date: line.documentDate,
        duedate: line.expiryDate,
        comment: line.comment || "",
        paymentreference: line.reference || "",
        relation: line.relationKey?.id || "",
        amount: 0,
        taxamount: 0,
        totalamount: 0,
        cn: false,
        paid: false,
        pdf: null,
      };
    }

    // Detect total / tax lines
    if (line.accountKey === generalAccount) {
      grouped[key].totalamount = Math.abs(line.bookingAmount);

      // Credit note detection: if bookingAmount is positive instead of negative
      if (line.bookingAmount > 0 && journalType === 1) {
        grouped[key].cn = true;
      }
      if (line.bookingAmount < 0 && journalType === 2) {
        grouped[key].cn = true;
      }
    } else if (line.accountKey === taxAccount) {
      grouped[key].taxamount = Math.abs(line.bookingAmount);
    }
  }

  // After grouping, calculate net amount
  Object.values(grouped).forEach(inv => {
    inv.amount = inv.totalamount - inv.taxamount;
  });

  return Object.values(grouped);
}

  return (
    <div className="content">
      <div className="import-form">
        {/* BookYear select */}
        <label>
          BookYear:
          <select
            value={bookYear}
            onChange={(e) => setBookYear(e.target.value)}
          >
            <option value="">-- Select Year --</option>
            <option value="11">2023</option>
            <option value="12">2024</option>
            <option value="13">2025</option>
          </select>
        </label>

        {/* JournalType select */}
        <label>
          JournalType:
          <select
            value={journalType}
            onChange={(e) => setJournalType(e.target.value)}
          >
            <option value="">-- Select Type --</option>
            <option value="1">Purchases</option>
            <option value="2">Sales</option>
          </select>
        </label>
      {/* Date input */}
        <label>
          Import Date:
          <input
            type="date"
            value={importDate}
            onChange={(e) => setImportDate(e.target.value)}
          />
        </label>
        {/* Buttons */}
        <div className="button-row">
          <CustomButton onClick={fetchInvoices}>Fetch</CustomButton>
          <CustomButton onClick={procInvoices}>Process</CustomButton>
        </div>
      </div>
    </div>
  );
}
