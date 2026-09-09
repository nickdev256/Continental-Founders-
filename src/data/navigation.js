export const navigation = [
  {
    label: "About",
    path: "/about",
  },

  {
    label: "Our Model",
    path: "/our-model",
  },

  {
    label: "Partners",
    path: "/strategic-partners",

    children: [
      {
        label: "U.S.–Africa Trade & Business Network",
        path: "/partners/us-africa-trade-network",
      },

      {
        label: "Universities",
        path: "/partners/universities",
      },

      {
        label: "Corporate Partners",
        path: "/partners/corporate",
      },

      {
        label: "Government & Development Institutions",
        path: "/partners/government-development",
      },
    ],
  },

  {
    label: "Events",
    path: "/events",
  },

  {
    label: "Insights",
    path: "/insights",
  },

  {
    label: "Contact",
    path: "/contact",
  },
];