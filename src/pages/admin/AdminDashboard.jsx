import React from "react";

import {
  CalendarDays,
  Newspaper,
  Mail,
  MessageSquareText,
  ArrowUpRight,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import "./AdminDashboard.css";


const cards = [
  {
    label: "Events",
    description:
      "Create and manage Continental Founders events.",
    path: "/admin/events",
    icon: CalendarDays,
  },
  {
    label: "Insights",
    description:
      "Publish articles, announcements, and research.",
    path: "/admin/insights",
    icon: Newspaper,
  },
  {
    label: "Newsletter",
    description:
      "View and manage newsletter subscribers.",
    path: "/admin/newsletter",
    icon: Mail,
  },
  {
    label: "Contacts",
    description:
      "Review website inquiries and engagement.",
    path: "/admin/contacts",
    icon: MessageSquareText,
  },
];


export default function AdminDashboard() {

  return (
    <section className="admin-dashboard">

      <div className="admin-dashboard__header">

        <div>

          <span className="admin-dashboard__eyebrow">
            ADMIN DASHBOARD
          </span>

          <h2>
            Welcome to Continental Founders CMS
          </h2>

          <p>
            Manage website content,
            engagement, and public information
            from one central workspace.
          </p>

        </div>

      </div>


      <div className="admin-dashboard__cards">

        {cards.map(
          (card) => {

            const Icon =
              card.icon;

            return (

              <Link
                key={card.path}
                to={card.path}
                className="admin-dashboard__card"
              >

                <div className="admin-dashboard__card-icon">

                  <Icon
                    size={22}
                    strokeWidth={1.6}
                  />

                </div>


                <div className="admin-dashboard__card-copy">

                  <h3>
                    {card.label}
                  </h3>

                  <p>
                    {card.description}
                  </p>

                </div>


                <ArrowUpRight
                  className="admin-dashboard__card-arrow"
                  size={19}
                  strokeWidth={1.6}
                />

              </Link>

            );

          }
        )}

      </div>

    </section>
  );
}