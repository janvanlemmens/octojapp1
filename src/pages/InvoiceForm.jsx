import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./InvoiceForm.css";

const initialState = {
  period: "",          // e.g. 202509
  journaltype: "",
  journalnr: "",
  documentnr: "",
  relationId: "",      // we'll send this to server to link to Relations
  amount: "",
  taxamount: "",
  totalamount: "",
  date: "",            // YYYY-MM-DD
  duedate: "",         // YYYY-MM-DD
  paid: false,
  paymentreference: "",
  comment: "",
  pdf: "",
};

export default function InvoiceForm({ existingInvoice, onSaved }) {
  const [form, setForm] = useState(() => {
    if (!existingInvoice) return initialState;
    // map existing invoice to form shape
    return {
      period: existingInvoice.period?.toString() ?? "",
      journaltype: existingInvoice.journaltype?.toString() ?? "",
      journalnr: existingInvoice.journalnr?.toString() ?? "",
      documentnr: existingInvoice.documentnr?.toString() ?? "",
      relationId: existingInvoice.relation?.id ?? "", // assuming server includes relation.id
      amount: existingInvoice.amount?.toString() ?? "",
      taxamount: existingInvoice.taxamount?.toString() ?? "",
      totalamount: existingInvoice.totalamount?.toString() ?? "",
      date: existingInvoice.date ?? "",
      duedate: existingInvoice.duedate ?? "",
      paid: !!existingInvoice.paid,
      paymentreference: existingInvoice.paymentreference ?? "",
      comment: existingInvoice.comment ?? "",
      pdf: existingInvoice.pdf ?? "",
    };
  });

  const [relations, setRelations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load relations from your server (which reads from Realm and returns JSON)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // adjust to your endpoint; earlier you had /realm-relations
        const res = await axios.get("http://localhost:5001/realm-relations");
        if (mounted) setRelations(res.data || []);
      } catch (e) {
        console.error("Failed to load relations", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // auto-calc total if amount or taxamount changes (you can remove if you want manual control)
  useEffect(() => {
    const amt = parseFloat(form.amount || "0");
    const tax = parseFloat(form.taxamount || "0");
    if (!Number.isNaN(amt) && !Number.isNaN(tax)) {
      setForm(f => ({ ...f, totalamount: (amt + tax).toString() }));
    }
  }, [form.amount, form.taxamount]);

  const invoiceId = useMemo(() => {
    const { period, journaltype, journalnr, documentnr } = form;
    if (period && journaltype && journalnr && documentnr) {
      return `${period}_${journaltype}_${journalnr}_${documentnr}`;
    }
    return "";
  }, [form.period, form.journaltype, form.journalnr, form.documentnr]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const resetForm = () => {
    setForm(initialState);
    setError("");
  };

  const validate = () => {
    if (!form.period || !/^\d{6}$/.test(form.period)) {
      return "Period must be YYYYMM (e.g., 202509).";
    }
    const reqFields = ["journaltype", "journalnr", "documentnr", "relationId", "amount", "taxamount", "date", "duedate"];
    for (const f of reqFields) {
      if (!form[f]) return `Missing required field: ${f}`;
    }
    return "";
  };

  const toPayload = () => ({
    // this structure matches your schema on the server side
    id: invoiceId,                                // composite
    period: parseInt(form.period, 10),
    journaltype: parseInt(form.journaltype, 10),
    journalnr: parseInt(form.journalnr, 10),
    documentnr: parseInt(form.documentnr, 10),
    relationId: form.relationId,                  // server should resolve/link this to a Relations object
    amount: parseFloat(form.amount),
    taxamount: parseFloat(form.taxamount),
    totalamount: parseFloat(form.totalamount || "0"),
    date: form.date,
    duedate: form.duedate,
    paid: !!form.paid,
    paymentreference: form.paymentreference || null,
    comment: form.comment || null,
    pdf: form.pdf || null,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }

    if (!invoiceId) {
      setError("Could not build invoice id from the fields.");
      return;
    }

    try {
      setSaving(true);
      // Adjust the URL to your API route. The server should upsert (create/update).
      const res = await axios.post("http://localhost:5001/invoices/upsert", toPayload());
      if (onSaved) onSaved(res.data);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || e.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="invoice-form" onSubmit={onSubmit}>
      <h2>{existingInvoice ? "Update Invoice" : "Create Invoice"}</h2>

      {error && <div className="error">{error}</div>}

      <div className="grid">
        <label>
          Period (YYYYMM)
          <input name="period" value={form.period} onChange={onChange} placeholder="202509" />
        </label>

        <label>
         Journal Type
         <select name="journaltype" value={form.journaltype} onChange={onChange}>
              <option value="">-- Select type --</option>
               <option value="1">Purchases</option>
            <option value="2">Sales</option>
         </select>
</label>

        <label>
          Journal Nr
          <input name="journalnr" value={form.journalnr} onChange={onChange} />
        </label>

        <label>
          Document Nr
          <input name="documentnr" value={form.documentnr} onChange={onChange} />
        </label>

        <label>
          Relation
          <select name="relationId" value={form.relationId} onChange={onChange}>
            <option value="">-- select relation --</option>
            {relations.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} {r.city ? `(${r.city})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          Amount
          <input name="amount" value={form.amount} onChange={onChange} type="number" step="0.01" />
        </label>

        <label>
          Tax Amount
          <input name="taxamount" value={form.taxamount} onChange={onChange} type="number" step="0.01" />
        </label>

        <label>
          Total Amount
          <input name="totalamount" value={form.totalamount} onChange={onChange} type="number" step="0.01" />
        </label>

        <label>
          Date
          <input name="date" value={form.date} onChange={onChange} type="date" />
        </label>

        <label>
          Due Date
          <input name="duedate" value={form.duedate} onChange={onChange} type="date" />
        </label>

        <label className="checkbox">
          <input type="checkbox" name="paid" checked={form.paid} onChange={onChange} />
          Paid
        </label>

        <label>
          Payment Reference
          <input name="paymentreference" value={form.paymentreference} onChange={onChange} />
        </label>

        <label className="span-2">
          Comment
          <textarea name="comment" value={form.comment} onChange={onChange} rows={3} />
        </label>

        <label className="span-2">
          PDF URL (optional)
          <input name="pdf" value={form.pdf} onChange={onChange} placeholder="https://..." />
        </label>
      </div>

      {/* Show the generated composite id */}
      <div className="id-preview">ID preview: <code>{invoiceId || "(fill required fields)"}</code></div>

      {/* Bottom buttons row */}
      <div className="button-row">
        <button type="button" className="secondary" onClick={resetForm}>Reset</button>
        <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      </div>
    </form>
  );
}
