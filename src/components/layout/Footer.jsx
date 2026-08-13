import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Linkedin, Instagram, Youtube } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <img src="/assets/continental-founders-logo.png" alt="Continental Founders™" />
            <p>
              Building strategic bridges between Africa and the United States through
              purposeful institutional partnership.
            </p>
          </div>

          <div className="footer__columns">
            <div>
              <span className="footer__label">Explore</span>
              <Link to="/about">About</Link>
              <Link to="/our-model">Our Model</Link>
              <Link to="/programs">Programs</Link>
              <Link to="/impact">Impact</Link>
            </div>
            <div>
              <span className="footer__label">Connect</span>
              <Link to="/university-partnerships">Universities</Link>
              <Link to="/strategic-partners">Strategic Partners</Link>
              <Link to="/events">Events</Link>
              <Link to="/insights">Insights</Link>
            </div>
            <div>
              <span className="footer__label">Contact</span>
              <Link to="/contact">Start a conversation <ArrowUpRight size={14} /></Link>
              <span>United States & Africa</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Continental Founders™. All rights reserved.</span>
          <div className="footer__socials" aria-label="Social links">
            <a href="#" aria-label="LinkedIn"><Linkedin size={16} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={16} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}