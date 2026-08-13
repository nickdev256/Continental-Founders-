import React from "react";
import { ArrowUpRight } from "lucide-react";
import Button from "../ui/Button";
import "./CTASection.css";

export default function CTASection({
  eyebrow = "Start a conversation",
  title = "Build a partnership with purpose.",
  text = "Tell us what you are trying to build, who you want to connect with, and where you see an opportunity for shared value."
}) {
  return (
    <section className="cta">
      <div className="container cta__inner">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <Button to="/contact" variant="gold" icon="up">Partner With Us</Button>
      </div>
    </section>
  );
}