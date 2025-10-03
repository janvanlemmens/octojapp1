import React , { useRef } from "react";
import "./InvoicesTable.css";

export default function InvoicesTable({ invoices, onRowDoubleClick, onRowClick }) {


const clickTimer = useRef(null);

   const handleClick = (inv) => {
    // cancel any previous timer
    clearTimeout(clickTimer.current);

    // schedule single-click with enough delay
    clickTimer.current = setTimeout(() => {
      onRowClick(inv);
    }, 250); // ~250ms is a good threshold
  };

  const handleDoubleClick = (inv) => {
    // cancel the single-click
    clearTimeout(clickTimer.current);
    onRowDoubleClick(inv);
  };

  return (
    <div className="table-container">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Invoice</th>
            <th>Date</th>
            <th>Due Date</th>
            <th>Supplier</th>
            <th className="amount">Amount</th>
            <th>Comment</th>
            <th>Payment Ref.</th>
            <th className="icon-col">Paid</th>
            <th className="icon-col">Pdf</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
           <tr
              key={inv.id}
              onDoubleClick={() => handleDoubleClick(inv)}
              onClick={() =>  handleClick(inv)}
              style={{ cursor: "pointer" }}
            >
              <td>{inv.period}</td>
              <td>{inv.documentnr}</td>
              <td>{inv.date}</td>
              <td>{inv.duedate}</td>
              <td>{inv.relation?.name}</td>
              <td className="amount">
                {inv.totalamount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "EUR",
                })}
              </td>
              <td>{inv.comment || ""}</td>
              <td>{inv.paymentreference || ""}</td>
               {/* Paid icon */}
          <td className="icon-col">
            {inv.paid ? (
              <span role="img" aria-label="paid">
                ✅
              </span>
            ) : (
              ""
            )}
          </td>

          {/* PDF icon */}
          <td className="icon-col">
            {inv.pdf ? (
              <span role="img" aria-label="pdf">
                📄
              </span>
            ) : (
              ""
            )}
          </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
