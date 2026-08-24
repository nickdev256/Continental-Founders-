import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import "./Button.css";

export default function Button({
  to,
  href,
  children,
  variant = "dark",
  external = false,
  icon = "arrow",
  className = "",
  ariaLabel,
}) {
  const buttonClassName = [
    "cf-button",
    `cf-button--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const Icon =
    icon === "up"
      ? ArrowUpRight
      : ArrowRight;

  const content = (
    <>
      <span className="cf-button__label">
        {children}
      </span>

      {icon !== "none" && (
        <Icon
          className="cf-button__icon"
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      )}
    </>
  );

  /*
   * External / normal anchor
   */
  if (href) {
    return (
      <a
        className={buttonClassName}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  /*
   * Internal React Router link
   */
  return (
    <Link
      className={buttonClassName}
      to={to || "#"}
      aria-label={ariaLabel}
    >
      {content}
    </Link>
  );
}