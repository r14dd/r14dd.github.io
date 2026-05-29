export type Project = {
  name: string;
  tech: string[];
  date?: string;
  impact?: string;
  bullets: string[];
  links?: {
    github?: string;
    demo?: string;
    crates?: string;
    docs?: string;
  };
};

export type Teaching = {
  title: string;
  skills: string;
  bullets: string[];
};

export type Testimonial = {
  name: string;
  title: string;
  course: string;
  headTA?: boolean;
  quote: string;
};

export type Profile = {
  hero: {
    name: string;
    tagline: string;
  };
  about: string;
  currently: string;
  email: string;
  links: {
    resume: string;
    linkedin: string;
    github: string;
  };
  experience: {
    role: string;
    org: string;
    location: string;
    period: string;
    bullets: string[];
  }[];
  projects: Project[];
  teaching: Teaching[];
  skills: {
    category: string;
    groups: { label: string; tier?: string; items: string[] }[];
  }[];
  testimonials: Testimonial[];
};


export const profile: Profile = {
  hero: {
    name: "Riad Mukhtarov",
    tagline: "",
  },

  about: "I develop software and AI systems in Rust and Python, with a focus on distributed systems and complex infrastructure. Before that, I taught computer science at State University of New York at Buffalo for two years. It shaped how I think about systems and how I explain them. I like hard problems and clean abstractions.",

  currently: "Building AI systems at International Bank of Azerbaijan.<br>Leading dev at European Youth Parliament Azerbaijan.",

  email: "riadmukh@gmail.com",

  links: {
    resume: "/riad_s_resume.pdf",
    linkedin: "https://linkedin.com/in/riadmukhtarov",
    github: "https://github.com/r14dd",
  },

  experience: [
    {
      role: "Artificial Intelligence Engineer",
      org: "ABB - International Bank of Azerbaijan",
      location: "Baku, Azerbaijan",
      period: "Apr 2026 – Present",
      bullets: [],
    },
    {
      role: "Head of IT Development Team",
      org: "European Youth Parliament Azerbaijan",
      location: "Baku, Azerbaijan",
      period: "Feb 2026 – Present",
      bullets: [
        "Coordinating website renewal, internal platform improvements, and new technology solutions to support organizational operations",
      ],
    },
    {
      role: "Information and Communication Technology (ICT) Assistant",
      org: "COP29 United Nations Climate Change Conference",
      location: "Baku, Azerbaijan",
      period: "Oct 2024 – Nov 2024",
      bullets: [
        "Ensured 99.9% uptime for IT infrastructure supporting 500+ delegates under strict SLAs",
        "Resolved real-time infrastructure and hybrid session incidents under strict availability requirements",
        "Assisted with access control, device hardening, and secure system handling",
        "Collaborated with vendors and technical teams to ensure uninterrupted operations",
      ],
    },
    {
      role: "Head Teaching Assistant — Data Structures",
      org: "State University of New York at Buffalo",
      location: "Buffalo, NY",
      period: "Aug 2022 – May 2024",
      bullets: [
        "Taught core data structures and algorithms in Scala and Java to ~1000 students",
        "Managed 20 TAs and coordinated course logistics with faculty",
        "Oversaw grading with emphasis on academic integrity",
        "Provided weekly reviews and debugging support to ~200 students",
      ],
    },
    {
      role: "Software Engineer",
      org: "EZ Pro Billing and Collection Inc.",
      location: "New York, NY",
      period: "Sep 2021 – May 2023",
      bullets: [
        "Built backend systems using Python and MongoDB with ADA-compliant frontend components",
        "Developed authentication and task-based point allocation system",
        "Optimized WebSockets, cutting server load 90% and enabling instant sync",
      ],
    },
  ],

  projects: [
    {
      name: "QuorumRAG.rs — Consensus-Based RAG",
      tech: ["Rust", "Ollama", "Tokio"],
      impact: "Multi-retriever RAG with quorum filtering requiring cross-retriever consensus before surfacing evidence. Achieved 95% recall vs 70% baseline.",
      date: "May 2026",
      bullets: [
        "Published to crates.io as an installable Rust crate (cargo add quorumrag)",
        "Built multi-retriever ensemble with Reciprocal Rank Fusion scoring and quorum filtering",
        "Implemented overlapping chunk processing with 50% stride to prevent boundary-split answers",
        "Added parallel embedding with caching to optimize cold-start performance",
      ],
      links: {
        crates: "https://crates.io/crates/quorumrag",
        docs: "https://docs.rs/quorumrag",
      },
    },
    {
      name: "almostAykhan — ABB Bank RAG Chatbot",
      tech: ["Python", "FastAPI", "OpenAI", "FAISS", "Docker"],
      impact: "RAG chatbot answering questions exclusively from ABB Bank's public content with multilingual support and strict context-only guardrails.",
      date: "May 2026",
      bullets: [
        "Built a two-service RAG pipeline (API gateway + QA service) scraping, chunking, and indexing ABB Bank pages via FAISS",
        "Implemented multilingual support across Azerbaijani, English, and Russian with prompt injection blocking",
        "Applied distance-gated out-of-scope detection to prevent hallucination — returns 'Bunu bilmirəm' for off-topic queries",
        "Added SQLite observability and Chart.js query analytics dashboard for monitoring chatbot usage",
      ],
      links: {
        github: "https://github.com/r14dd/almostAykhan",
      },
    },
    {
      name: "MatchSentinel — Transaction Monitoring Platform",
      tech: [
        "Java",
        "Spring Boot",
        "RabbitMQ",
        "PostgreSQL",
        "Liquibase",
        "Docker",
        "AWS EC2",
      ],
      impact:
        "End-to-end transaction monitoring pipeline with event-driven scoring, async processing via RabbitMQ, and idempotent data handling.",
      date: "Jan 2026",
      bullets: [
        "Designed event-driven architecture for scoring, notifications, and reporting",
        "Built async processing with RabbitMQ and safe reprocessing",
        "Implemented per-service databases with Liquibase migrations and environment-based configuration",
        "Deployed to AWS EC2 with Docker Compose, Linux networking, and public endpoints",
      ],
      links: {
        github: "https://github.com/r14dd/matchsentinel",
      },
    },
    {
      name: "Raft-Based Consensus Algorithm",
      tech: ["Go", "UDP", "Protobuf"],
      impact:
        "Raft consensus preserving consistency under node failures via leader election and log replication.",
      date: "May 2024",
      bullets: [
        "Implemented Raft consensus with leader election, log replication, and fault tolerance",
        "Built concurrent server components to maintain consistency across distributed nodes",
      ],
    },
    {
      name: "Distributed Hash Table (Kademlia)",
      tech: ["Go", "TCP", "Protobuf"],
      impact:
        "Kademlia DHT for resilient peer discovery and O(log n) lookups in dynamic networks.",
      date: "Feb 2024",
      bullets: [
        "Implemented a peer-to-peer distributed storage system using Kademlia routing",
        "Achieved efficient O(log n) lookups and resilient data routing across nodes",
      ],
    },
    {
      name: "Redis Redesign",
      tech: ["Rust", "Redis"],
      impact:
        "Two-layer TTL-aware cache eliminating stale-data inconsistency while preserving low-latency access.",
      date: "Dec 2025",
      bullets: [
        "Replaced a monolithic cache with two layers: key-subkey to id mapping and id to value storage",
        "Applied TTL lifecycle control to expire stale entries predictably",
        "Implemented garbage collection to remove expired entries and dangling cross-layer references",
        "Preserved low-latency access while improving consistency in distributed workloads",
      ],
    },
    {
      name: "Minimalist Portfolio",
      tech: ["Astro", "TypeScript", "CSS"],
      impact: "Responsive portfolio with strong typographic hierarchy, smooth animations, and accessibility-first design.",
      date: "Jan 2026",
      bullets: [
        "Designed a minimalist layout with strong typographic hierarchy and readable spacing",
        "Implemented responsive navigation for desktop and mobile with smooth interactions",
        "Added polished micro-animations while honoring prefers-reduced-motion",
      ],
      links: {
        github: "https://github.com/r14dd/r14dd.github.io",
      },
    },
  ],
  teaching: [
  {
    title: "Data Structures",
    skills: "Java · Algorithms & Complexity · Scala · Git · Data Structures",
    bullets: [
      "Supported 900+ students through office hours, recitations, review sessions, and Q&A sessions",
      "Taught core data structures and algorithms used to solve real-world computational problems",
      "Guided students in understanding complexity analysis, trade-offs, and data structure selection",
      "Helped students analyze and implement data structures in Java and Scala programs",
      "Explained the relationship between data structures and algorithms in practical system design",
    ],
  },
  {
    title: "Web Applications",
    skills: "Python · Flask · FastAPI · REST APIs · HTTP(S) · Back-End Web Development",
    bullets: [
      "Assisted 240 students in building full-stack web applications without pre-built frameworks",
      "Emphasized server-side architecture, request handling, and backend logic",
      "Taught HTTP(S), REST APIs, AJAX, authentication, encryption, and socket-based communication",
      "Guided students in designing and deploying database-backed applications using MySQL and MongoDB",
    ],
  },
  {
    title: "Software Quality in Practice",
    skills: "Git · Linux · GDB · QA Engineering · Code Coverage · Trello · Make",
    bullets: [
      "Evaluated teamwork and software quality for 120 students across multiple assignments",
      "Assessed students’ ability to design, implement, and evaluate computing-based solutions",
      "Focused on correctness, testing practices, debugging, and professional software standards",
      "Reviewed code for maintainability, reliability, and adherence to project requirements",
    ],
  },
  {
    title: "Discrete Structures",
    skills: "Logic · Proofs · Discrete Mathematics",
    bullets: [
      "Taught discrete structures concepts to 200+ students through office hours and recitations",
      "Managed recitation sections and addressed student questions on formal reasoning and proofs",
      "Graded homework on propositions, proofs, and foundational discrete mathematics topics",
    ],
  },
  {
    title: "Introduction to Computer Science",
    skills: "Python",
    bullets: [
      "Taught introductory Python programming to 50+ students through twice-weekly lab sessions",
      "Held office hours to support students outside the classroom and reinforce core concepts",
      "Helped remove barriers between students and instructors to improve learning outcomes",
    ],
  },
  {
    title: "Computer Organization",
    skills: "MIPS Assembly · SystemVerilog · Computer Architecture",
    bullets: [
      "Assisted 400+ students with coursework on instruction set architecture and computer organization",
      "Supported topics including ALU design, pipelining, memory hierarchy, and control units",
      "Held office hours, graded assignments and exams, and conducted review sessions",
      "Created instructional materials and supported students with special accommodations",
    ],
  },
],
  skills: [
    {
      category: "Programming Languages",
      groups: [
        { label: "", items: ["Rust", "Python", "Go", "C"] },
      ],
    },
    {
      category: "Backend & Runtimes",
      groups: [
        { label: "", items: ["Axum", "Actix-web", "Tokio", "FastAPI", "Flask"] },
      ],
    },
    {
      category: "AI, ML & Agentic Systems",
      groups: [
        { label: "", items: ["LangGraph", "LangChain", "FAISS", "Ollama", "LangSmith", "NVIDIA OpenShell"] },
      ],
    },
    {
      category: "Communication Protocols & APIs",
      groups: [
        { label: "", items: ["gRPC", "RESTful APIs", "GraphQL", "WebSockets", "WebRTC"] },
      ],
    },
    {
      category: "Messaging & Integration",
      groups: [
        { label: "", items: ["Apache Kafka", "RabbitMQ"] },
      ],
    },
    {
      category: "Databases & Persistence",
      groups: [
        { label: "", items: ["PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "pgvector"] },
      ],
    },
    {
      category: "Cloud, Infrastructure & DevOps",
      groups: [
        { label: "", items: ["AWS", "Supabase", "Docker", "Kubernetes", "GitHub Actions", "GitLab CI/CD", "Linux"] },
      ],
    },
    {
      category: "Testing & Quality Assurance",
      groups: [
        { label: "", items: ["Pytest", "rstest", "Selenium", "Postman"] },
      ],
    },
  ],
  testimonials: [
    {
      name: "Oliver Kennedy",
      title: "Associate Professor, State University of New York at Buffalo",
      course: "Data Structures",
      headTA: true,
      quote: "Put him into a Project Manager/Team Lead role, and I guarantee to you that he will shine.",
    },
    {
      name: "Jesse Hartloff",
      title: "Associate Professor of Teaching, State University of New York at Buffalo",
      course: "Web Applications",
      quote: "He not only demonstrated a great technical understanding of the content but was able to explain these concepts in a simple manner to students who were struggling to apply the material.",
    },
    {
      name: "Carl Alphonce",
      title: "Professor of Teaching, State University of New York at Buffalo",
      course: "Software Quality in Practice",
      quote: "He was very responsive to requests, professional in all his interactions with students and course staff, and technically competent in all the tools and processes covered in the course.",
    },
    {
      name: "Nasrin Akhter",
      title: "Assistant Professor of Teaching, State University of New York at Buffalo",
      course: "Discrete Structures",
      quote: "I was impressed by his strong work ethic, positive attitude, professionalism, and dedication. He proved himself to be an organized, efficient, and hardworking TA.",
    },
    {
      name: "Sean Mackay",
      title: "Assistant Professor of Computer Science, University of Oklahoma",
      course: "Introduction to Computer Science",
      quote: "Riad is one of the best individuals I have ever had the opportunity to work with. His ability to communicate complex concepts to a range of skill levels continually impressed me.",
    },
    {
      name: "Farshad Ghanei",
      title: "Associate Teaching Professor, Illinois Institute of Technology",
      course: "Computer Organization",
      quote: "I attest to Riad's work ethics, skill, performance, and communication. I do not hesitate to recommend Riad to any employer.",
    },
  ],
};
