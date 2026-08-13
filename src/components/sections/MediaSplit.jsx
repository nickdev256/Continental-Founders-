import React from "react";
import Button from "../ui/Button";
import "./MediaSplit.css";

export default function MediaSplit({
  eyebrow,
  title,
  text,
  image,
  imageAlt,
  reverse = false,
  buttonText,
  buttonTo = "/contact"
}) {
  return (
    <section className={`media-split ${reverse ? "media-split--reverse" : ""}`}>
      <div className="container media-split__grid">
        <div className="media-split__image">
          <img src={image} alt={imageAlt} loading="lazy" />
        </div>
        <div className="media-split__content">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <div className="media-split__copy">
            {text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {buttonText && <Button to={buttonTo} variant="outline">{buttonText}</Button>}
        </div>
      </div>
    </section>
  );
}