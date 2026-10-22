export const navigation = [
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Fellowship Community",
    children: [
      {
        label: "Apply to CF Fellows",
        path: "/cfcv/apply",
      },
    ],
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
        path: "/universities",
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
    children: [
      {
        label: "All Insights",
        path: "/insights",
      },
      {
        label: "Gallery",
        path: "/gallery",
      },
    ],
  },
  {
    label: "Contact",
    path: "/contact",
  },
];