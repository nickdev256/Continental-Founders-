import React from "react";
import { ArrowUpRight } from "lucide-react";
import "./EventList.css";

export default function EventList({ events }) {
  return (
    <div className="event-list">
      {events.map((event) => (
        <article className="event-row" key={event.title}>
          <div className="event-row__date">
            <span>{event.type}</span>
            <strong>{event.date}</strong>
          </div>
          <div>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
          </div>
          <div className="event-row__location">{event.location}</div>
          <ArrowUpRight className="event-row__arrow" size={21} />
        </article>
      ))}
    </div>
  );
}