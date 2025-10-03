import React , { useState } from 'react'
import axios from 'axios';
import CustomButton from '../ui/CustomButton';
import "./Import.css"


export default function Import() {
    const [ invoices, setInvoices] = useState([])

    const fetchInvoices = async () => {
    try {
        const response = await axios.get("http://localhost:5001/octo-bookm");
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
        
            const response = await axios.post("http://localhost:5001/realm-addinvoice",res)
            console.log(response.data)
        
    }

  }

  function processInvoices(invoices) {
  const grouped = {};

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
    if (line.accountKey === 440000) {
      grouped[key].totalamount = Math.abs(line.bookingAmount);

      // Credit note detection: if bookingAmount is positive instead of negative
      if (line.bookingAmount > 0) {
        grouped[key].cn = true;
      }
    } else if (line.accountKey === 411000) {
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
    <main className="content">

    <div className="relation-container">
         <div className="button-row"> 
        <CustomButton onClick={fetchInvoices}>Fetch InVoices</CustomButton>
        <CustomButton onClick={procInvoices}>Proc Relations</CustomButton>
          </div>
     </div>
    </main>
  )
}
