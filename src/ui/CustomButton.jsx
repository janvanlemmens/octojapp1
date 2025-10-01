import React from "react";
import "./CustomButton.css";

export default function CustomButton({ children, onClick, type }) {
  return (
    <button
      type={type ? type : "button"}
      onClick={onClick}
      className="custom-button"
    >
      {children}
    </button>
  );
}
