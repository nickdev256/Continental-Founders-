import React from "react";
import { ArrowUpRight } from "lucide-react";
import "./ProcessGrid.css";

const steps = [
  ["01", "Discover", "Understand institutional priorities, strengths, needs, and the opportunity for collaboration."],
  ["02", "Align", "Bring the right stakeholders together around shared objectives and realistic expectations."],
  ["03", "Design", "Shape the partnership architecture, roles, pathways, and initial areas of activity."],
  ["04", "Activate", "Move from planning to practical programs, conversations, exchanges, and collaboration."],
  ["05", "Learn", "Review what is working, what is changing, and where the relationship can create more value."]
];

export default function ProcessGrid() {
  return (
    <div className="process-grid">
      {steps.map(([number, title, text]) => (
        <article className="process-item" key={number}>
          <div className="process-item__top">
            <span>{number}</span>
            <ArrowUpRight size={18} />
          </div>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}