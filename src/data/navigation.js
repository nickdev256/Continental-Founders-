import {
  BookOpen,
  Building2,
  FileSignature,
  Globe2,
  GraduationCap,
  Images,
  Landmark,
} from "lucide-react";

/*
 * Main site navigation.
 * Items with `children` open a full-width menu on desktop.
 * `intro` is the short line shown on the left of that menu,
 * `feature` is the photo card shown on the right.
 * `accent` picks the section colour (see ACCENTS in Navbar.jsx);
 * a child's `color` overrides the colour of its icon tile.
 */
export const navigation = [
  {
    label: "About",
    path: "/about",
    accent: "blue",
    description: "Our mission, vision and the people behind Continental Founders.",
  },
  {
    label: "Fellowship Community",
    path: "/fellowship-community",
    accent: "gold",
    intro:
      "Three pathways, one cohort. Founders in Africa and the United States build their businesses together.",
    children: [
      {
        label: "Apply to CF Fellows",
        color: "gold",
        path: "/cfcv/apply",
        icon: FileSignature,
        description: "Start your fellowship application.",
      },
    ],
    feature: {
      image: "/assets/images/hero-community.webp",
      eyebrow: "Flagship programme",
      title: "Great ventures start with meaningful connections.",
      cta: "Explore the fellowship",
      path: "/cfcv",
    },
  },
  {
    label: "Partners",
    path: "/strategic-partners",
    accent: "navy",
    intro:
      "We connect universities, companies and institutions with founders across Africa and the United States.",
    children: [
      {
        label: "U.S.–Africa Trade & Business Network",
        color: "navy",
        path: "/partners/us-africa-trade-network",
        icon: Globe2,
        description: "Trade, market access and business links across continents.",
      },
      {
        label: "Universities",
        color: "blue",
        path: "/universities",
        icon: GraduationCap,
        description: "Research, student founders and campus partnerships.",
      },
      {
        label: "Corporate Partners",
        color: "gold",
        path: "/partners/corporate",
        icon: Building2,
        description: "Industry expertise, founder ambition, commercial opportunity.",
      },
      {
        label: "Government & Development Institutions",
        color: "violet",
        path: "/partners/government-development",
        icon: Landmark,
        description: "Public partners building enterprise ecosystems.",
      },
    ],
    feature: {
      image: "/assets/images/hero-partnership.webp",
      eyebrow: "Partner with us",
      title: "Build the bridge between continents with us.",
      cta: "See partnership options",
      path: "/strategic-partners",
    },
  },
  {
    label: "Events",
    path: "/events",
    accent: "coral",
    description: "Upcoming gatherings, summits and founder sessions.",
  },
  {
    label: "Insights",
    path: "/insights",
    accent: "violet",
    intro:
      "Ideas, stories and evidence from founders and partners across our network.",
    children: [
      {
        label: "All Insights",
        color: "violet",
        path: "/insights",
        icon: BookOpen,
        description: "Articles, research and founder stories.",
      },
      {
        label: "Gallery",
        color: "coral",
        path: "/gallery",
        icon: Images,
        description: "Moments from our events and community.",
      },
    ],
    feature: {
      image: "/assets/images/innovation-entrepreneurship.webp",
      eyebrow: "Latest thinking",
      title: "Read what our founders and partners are learning.",
      cta: "Read insights",
      path: "/insights",
    },
  },
  {
    label: "Contact",
    path: "/contact",
    accent: "blue",
    description: "Get in touch with our team.",
  },
];
