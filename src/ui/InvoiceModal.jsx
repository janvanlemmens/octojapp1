// InvoiceModal.jsx
import React, { useState } from "react";
import "./InvoiceModal.css";

export default function InvoiceModal({ invoice, onClose, onSave }) {

     if (!invoice) return null;
  const [ pdffol, pdfname ] = invoice.pdf ? invoice.pdf.split("/") : [null, null];

  const [comment, setComment] = useState(invoice.comment || "");
  const [paid, setPaid] = useState(invoice.paid || false);
  const [payref, setPayref] = useState(invoice.paymentreference || "");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...invoice,
      comment,
      paid,
      paymentreference: payref,
      pdf: file ? file.name :  pdfname// here you’d normally upload file and store path/url
    };
    onSave(updated);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Invoice {invoice.documentnr}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Comment
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>
          <label>
            PaymentReference
            <input
              type="text"
              value={payref}
              onChange={(e) => setPayref(e.target.value)}
            />
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
            />
            Paid
          </label>

          <label>
            Attach file
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <div style={{ marginTop: "4px", fontSize: "0.9em", color: "#ccc" }}>
          {file
            ? `New file selected: ${file.name}`
            : pdfname
            ? `Current file: ${pdfname}`
            : "No file uploaded"}
        </div>
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
