import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import "./Button.css";

export default function Button({ to, href, children, variant = "dark", external = false, icon = "arrow" }) {
  const content = (
    <>
      <span>{children}</span>
      {icon === "up" ? <ArrowUpRight size={17} /> : <ArrowRight size={17} />}
    </>
  );

  if (href) {
    return <a className={`cf-button cf-button--${variant}`} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{content}</a>;
  }

  return <Link className={`cf-button cf-button--${variant}`} to={to}>{content}</Link>;
}