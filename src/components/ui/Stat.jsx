import React from "react";
import "./Stat.css";

export default function Stat({ value, label, note }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
      {note && <small>{note}</small>}
    </div>
  );
}