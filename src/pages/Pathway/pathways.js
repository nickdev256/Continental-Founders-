import {
  BadgeCheck,
  Banknote,
  Building2,
  Compass,
  Gauge,
  Globe2,
  Handshake,
  Lightbulb,
  LineChart,
  ListChecks,
  Map,
  MessagesSquare,
  Network,
  Route,
  Scale,
  Settings2,
  Ship,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

/* ============================================================
   FELLOWSHIP PATHWAYS
   The words for the Genesis, Ascend and Horizon pages, kept
   exactly as written. PathwayPage.jsx lays them out.
============================================================ */

// The three pathways, shown together in "Three pathways. One shared cohort."
export const PATHWAY_LIST = [
  {
    key: "genesis",
    name: "GENESIS",
    tagline: "BUILD IT",
    stage: "IDEA STAGE",
    path: "/genesis",
    image: "/assets/kk.webp",
    imageAlt: "Founder starting a venture on a laptop",
  },
  {
    key: "ascend",
    name: "ASCEND",
    tagline: "PROVE IT",
    stage: "EARLY OPERATING",
    path: "/ascend",
    image: "/assets/x.webp",
    imageAlt: "Founders refining their business model in a workshop",
  },
  {
    key: "horizon",
    name: "HORIZON",
    tagline: "SCALE IT",
    stage: "GROWTH-READY",
    path: "/horizon",
    image: "/assets/venture.webp",
    imageAlt: "Founders planning growth in an office overlooking the city",
  },
];

// Fields every interest form starts with.
export const COMMUNITY_OPTIONS = [
  "Africa-based entrepreneur",
  "U.S.-based entrepreneur of African descent",
  "Request eligibility guidance",
];

export const PATHWAYS = {
  genesis: {
    name: "Genesis",
    hero: {
      number: "01",
      eyebrow: "YOUR IDEA HAS A FUTURE",
      lines: ["Start with an idea.", "Build with a community."],
      text:
        "Have a business idea but aren't sure where to begin? Genesis helps you turn it into a practical concept while connecting with entrepreneurs across Africa and the U.S. African diaspora.",
      cardLabel: "CONTINENTAL FOUNDERS / IDEA STAGE",
    },
    fit: [
      "I have a business idea, but I don't know how to begin.",
      "I believe my idea could solve a problem, but I haven't tested it.",
      "I'm unsure who my customers are or whether they will pay.",
      "I need mentorship and a supportive entrepreneurial community.",
      "I want to build relationships across Africa and the United States.",
      "I want to turn my experience or passion into a business.",
    ],
    challenges: [
      { icon: Compass, title: "I don't know where to start", text: "Focus your idea into a clear business concept." },
      { icon: Users, title: "I don't know my customers", text: "Identify the people, needs, and problems to solve." },
      { icon: Scale, title: "I'm afraid of costly mistakes", text: "Test assumptions before committing major resources." },
      { icon: Lightbulb, title: "I lack business experience", text: "Learn foundational entrepreneurial and decision-making skills." },
      { icon: Network, title: "I don't have a network", text: "Connect with founders at different stages and across continents." },
      { icon: Map, title: "I don't know my next step", text: "Create an actionable roadmap with milestones." },
    ],
    valueTitle:
      "Build more than a business idea. Build your foundation and your network.",
    value: [
      { icon: Target, title: "Business clarity", text: "Define your problem, solution, and purpose." },
      { icon: Users, title: "Customer understanding", text: "Identify and listen to potential customers." },
      { icon: BadgeCheck, title: "Idea validation", text: "Test assumptions and gather feedback." },
      { icon: Wrench, title: "Practical skills", text: "Explore models, pricing, planning, and execution." },
      { icon: Globe2, title: "Cross-continental connections", text: "Build relationships across Africa and the U.S." },
      { icon: Route, title: "Next-step roadmap", text: "Set realistic validation or launch milestones." },
    ],
    form: {
      draftTitle: "CONTINENTAL FOUNDERS — GENESIS EXPRESSION OF INTEREST",
      fileName: "CF_GENESIS_Interest_Draft.txt",
      questions: [
        { name: "idea", label: "Tell us about your business idea.", placeholder: "What would you like to create, offer, or build?" },
        { name: "problem", label: "What problem would your idea solve, and for whom?", placeholder: "Who might benefit from your solution?" },
        { name: "challenge", label: "What is your biggest challenge?", placeholder: "Idea clarity, customers, validation, skills, network, or something else?" },
        { name: "goal", label: "What would you like to accomplish in the next six months?", placeholder: "Describe the progress you hope to make." },
        { name: "collaboration", label: "Why connect with founders across Africa and the United States?", placeholder: "What would you like to learn or contribute?" },
      ],
    },
    faqs: [
      { q: "Do I need an existing business?", a: "No. Genesis is designed for people at the idea stage, including those who have not launched." },
      { q: "Will I only learn with Genesis founders?", a: "No. Genesis-specific development is complemented by shared learning with Ascend and Horizon." },
      { q: "Do I need international trade experience?", a: "No. Business fundamentals and trusted relationships come first." },
      { q: "Does selecting Genesis guarantee admission?", a: "No. Pathway interest is provisional and subject to review." },
      { q: "Is funding guaranteed?", a: "No. Any catalytic grant availability and criteria must be confirmed separately." },
    ],
  },

  ascend: {
    name: "Ascend",
    hero: {
      number: "02",
      eyebrow: "TURN ACTIVITY INTO TRACTION",
      lines: ["You started something.", "Now build what works."],
      text:
        "You've launched a product, service, or enterprise. Ascend helps you strengthen customer demand, sharpen decisions, and build a foundation for sustainable growth alongside founders across two continents.",
      cardLabel: "CONTINENTAL FOUNDERS / EARLY OPERATING",
    },
    fit: [
      "I have started a business, but customer demand is inconsistent.",
      "I need to understand what customers value and will pay for.",
      "I'm working hard but need stronger systems and clearer priorities.",
      "I want to improve pricing, sales, and business decisions.",
      "I want trusted professional relationships across Africa and the U.S.",
      "I'm ready to test what works before expanding.",
    ],
    challenges: [
      { icon: LineChart, title: "Inconsistent sales", text: "Understand customers and test repeatable sales approaches." },
      { icon: Banknote, title: "Unclear business model", text: "Examine pricing, costs, revenue, and delivery assumptions." },
      { icon: ListChecks, title: "Too many priorities", text: "Set focused milestones and improve decision-making." },
      { icon: Settings2, title: "Weak operating systems", text: "Strengthen essential workflows and business discipline." },
      { icon: Network, title: "Limited professional network", text: "Collaborate with African and U.S. diaspora peers." },
      { icon: Gauge, title: "Uncertain growth readiness", text: "Build evidence of traction before scaling." },
    ],
    valueTitle:
      "Develop your business. Expand your network. Build future opportunities.",
    value: [
      { icon: TrendingUp, title: "Customer traction", text: "Understand target customers and repeat demand." },
      { icon: Banknote, title: "Business model discipline", text: "Evaluate pricing, costs, revenue, and value delivery." },
      { icon: Settings2, title: "Operational strength", text: "Improve workflows, planning, and accountability." },
      { icon: LineChart, title: "Evidence-based decisions", text: "Use customer feedback and business metrics." },
      { icon: Globe2, title: "Cross-continental network", text: "Develop reciprocal relationships across continents." },
      { icon: Route, title: "Growth roadmap", text: "Define milestones for a more resilient business." },
    ],
    form: {
      draftTitle: "CONTINENTAL FOUNDERS — ASCEND EXPRESSION OF INTEREST",
      fileName: "CF_ASCEND_Interest_Draft.txt",
      questions: [
        { name: "business", label: "Describe your current business.", placeholder: "What do you offer, and how long have you been operating?" },
        { name: "customers", label: "Who are your customers?", placeholder: "Describe your customers and current sales activity." },
        { name: "challenge", label: "What is your biggest operating challenge?", placeholder: "Customers, sales, pricing, systems, cash flow, positioning?" },
        { name: "goal", label: "What progress would you like in six months?", placeholder: "Describe measurable outcomes you would value." },
        { name: "collaboration", label: "Why does transatlantic collaboration interest you?", placeholder: "What could you learn from or contribute to others?" },
      ],
    },
    faqs: [
      { q: "Do I need a registered company?", a: "Ascend is designed for founders operating or testing a venture. Final documentation requirements must be confirmed." },
      { q: "Do I need consistent revenue?", a: "No fixed revenue threshold is proposed. You should be able to describe activity or early traction." },
      { q: "Will I only learn with Ascend founders?", a: "No. Ascend-specific development is complemented by shared activities with Genesis and Horizon." },
      { q: "Does Ascend guarantee customers or funding?", a: "No. Commercial outcomes and grants are not guaranteed." },
      { q: "What if I'm ready to scale?", a: "The team can assess whether Horizon is a better fit." },
    ],
  },

  horizon: {
    name: "Horizon",
    hero: {
      number: "03",
      eyebrow: "THINK BEYOND BORDERS",
      lines: ["Your business has momentum.", "Expand your possibilities."],
      text:
        "Horizon helps operating founders assess growth readiness, strengthen strategy, and build credible cross-continental relationships for future market access, partnerships, and international trade.",
      cardLabel: "CONTINENTAL FOUNDERS / GROWTH-READY",
    },
    fit: [
      "My business has established products or services and operating experience.",
      "I want to enter new markets but need a realistic strategy.",
      "I need stronger systems and leadership capacity for expansion.",
      "I want to understand procurement, partnerships, and trade readiness.",
      "I need credible relationships across Africa and the U.S. diaspora.",
      "I want to evaluate growth opportunities before committing resources.",
    ],
    challenges: [
      { icon: Compass, title: "Unclear expansion strategy", text: "Prioritize markets, customers, and feasible routes to growth." },
      { icon: Map, title: "Limited market access", text: "Map potential channels, buyers, and partnership pathways." },
      { icon: Settings2, title: "Operational constraints", text: "Assess systems, teams, and delivery readiness." },
      { icon: Handshake, title: "Partnership uncertainty", text: "Define criteria for credible, mutually beneficial partners." },
      { icon: Banknote, title: "Capital readiness gaps", text: "Identify financial information and readiness improvements." },
      { icon: Ship, title: "Cross-border complexity", text: "Explore compliance, logistics, and trade-readiness questions." },
    ],
    valueTitle:
      "Develop your business. Expand your network. Build future opportunities.",
    value: [
      { icon: TrendingUp, title: "Growth strategy", text: "Prioritize commercially realistic opportunities." },
      { icon: Target, title: "Market readiness", text: "Evaluate customer demand and entry requirements." },
      { icon: Handshake, title: "Partnership preparation", text: "Define partner criteria and collaboration models." },
      { icon: Building2, title: "Operational capacity", text: "Assess systems, talent, delivery, and governance." },
      { icon: Ship, title: "Trade awareness", text: "Identify cross-border logistics and compliance questions." },
      { icon: MessagesSquare, title: "Trusted networks", text: "Build long-term relationships across Africa and the U.S." },
    ],
    form: {
      draftTitle: "CONTINENTAL FOUNDERS — HORIZON EXPRESSION OF INTEREST",
      fileName: "CF_HORIZON_Interest_Draft.txt",
      questions: [
        { name: "business", label: "Describe your business and its current scale.", placeholder: "Products, operating history, customers, and markets." },
        { name: "opportunity", label: "What growth opportunity are you considering?", placeholder: "New geography, procurement, partnership, export, or offering?" },
        { name: "barrier", label: "What is your largest expansion barrier?", placeholder: "Market intelligence, operations, finance, partners, regulation?" },
        { name: "goal", label: "What would successful progress look like in six months?", placeholder: "Describe realistic readiness or relationship milestones." },
        { name: "contribution", label: "What can you contribute to a mixed-stage cohort?", placeholder: "Your expertise, perspective, and collaborative interests." },
      ],
    },
    faqs: [
      { q: "Do I need to be exporting already?", a: "No. Horizon supports growth-ready founders exploring future cross-border opportunities." },
      { q: "Is Horizon an investor or trade broker?", a: "No. It is a founder development and relationship-building pathway; deals are not guaranteed." },
      { q: "Will I interact with early-stage founders?", a: "Yes. Shared cohort exchange is central to the Fellowship." },
      { q: "Is there a minimum revenue threshold?", a: "No threshold is specified in the concept. Growth-readiness criteria require formal approval." },
      { q: "Are introductions and grants guaranteed?", a: "No. They depend on program arrangements, eligibility, and partner participation." },
    ],
  },
};

// The last question was the same on all three pages.
export const SHARED_FAQ = {
  q: "What if this pathway isn't right for me?",
  a: "Choose \"I'm not sure\" on the interest form. The Fellowship team can help assess the most suitable pathway; no final placement is made here.",
};

