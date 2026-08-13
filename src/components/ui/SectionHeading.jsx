import React from "react";
import "./SectionHeading.css";

export default function SectionHeading({ eyebrow, title, text, align = "left" }) {
  return (
    <div className={`section-heading cf-heading cf-heading--${align}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}