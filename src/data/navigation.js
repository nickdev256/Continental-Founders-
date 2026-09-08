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
    path: "/university-partnerships",

    children: [
      {
        label: "University Partners",
        path: "/university-partnerships",
      },

      {
        label: "Strategic Partners",
        path: "/strategic-partners",
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