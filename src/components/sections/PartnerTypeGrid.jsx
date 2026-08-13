import React from "react";
import { ArrowUpRight } from "lucide-react";
import { partnerTypes } from "../../data/partners";
import "./PartnerTypeGrid.css";

export default function PartnerTypeGrid() {
  return (
    <div className="partner-grid">
      {partnerTypes.map((partner) => (
        <article className="partner-card" key={partner.title}>
          <span className="partner-card__line" />
          <div className="partner-card__arrow"><ArrowUpRight size={20} /></div>
          <h3>{partner.title}</h3>
          <p>{partner.description}</p>
        </article>
      ))}
    </div>
  );
}