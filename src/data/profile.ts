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
  badges?: { api: string; pillLabel: string; platform: string; link?: string }[];
};

export type Teaching = {
  title: string;
  skills: string;
};

export type Testimonial = {
  name: string;
  title: string;
  course: string;
  headTA?: boolean;
  quote: string;
  linkedin?: string;
};

export type Profile = {
  hero: {
    name: string;
    tagline: string;
  };
  about: string;
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

  about: "develops software and AI systems in Rust and Python, with a focus on distributed systems and complex infrastructure. Before that, he taught computer science at State University of New York at Buffalo. He likes complicated challenges and clean abstractions.",

  email: "riad@riad.cc",

  links: {
    resume: "/resume.pdf",
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
      role: "Head of IT",
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
      name: "patent",
      tech: ["Rust", "Tokio", "Ollama", "ratatui", "fastembed"],
      impact: "CLI that takes a plain-English dev-tool idea, searches open-source registries for existing implementations, ranks matches with local embeddings, and writes a scoped verdict via LLM.",
      date: "Jun 2026",
      bullets: [
        "Built concurrent source adapters for crates.io, npm, PyPI, GitHub, Go, Maven, NuGet, RubyGems, Docker Hub, VS Code Marketplace, and Hacker News",
        "Designed integrity-scoped verdict system that never asserts absence — only reports what was found in sources checked",
        "Added interactive ratatui TUI with detail view, browser open, and structured JSON output for CI pipelines",
      ],
      links: {
        crates: "https://crates.io/crates/patent",
        docs: "https://docs.rs/patent",
        github: "https://github.com/r14dd/patent",
      },
      badges: [
        { api: "https://api.github.com/repos/r14dd/patent", pillLabel: "stars", platform: "on GitHub", link: "https://github.com/r14dd/patent" },
        { api: "https://crates.io/api/v1/crates/patent", pillLabel: "downloads", platform: "on crates.io", link: "https://crates.io/crates/patent" },
      ],
    },
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
        "Clustered evidence via cosine-similarity centroids so the quorum vote operates on deduplicated semantic groups",
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
        "Docker",
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
        "Implemented leader election with randomized timeouts and term-based logical clocks to prevent split votes",
        "Built log replication via AppendEntries RPC with consistency checks and quorum-based commitment",
        "Handled node failures and network partitions while tolerating up to ⌊n/2⌋ server failures",
        "Enforced safety guarantees ensuring elected leaders always contain all previously committed entries",
        "Designed custom RPC framework over UDP with Protobuf serialization, retransmission, and message deduplication",
      ],
    },
    {
      name: "Distributed Hash Table (Kademlia)",
      tech: ["Go", "TCP", "Protobuf"],
      impact:
        "Kademlia DHT for resilient peer discovery and O(log n) lookups in dynamic networks.",
      date: "Feb 2024",
      bullets: [
        "Implemented XOR-based distance metric with k-bucket routing tables for peer organization",
        "Built iterative node lookup with α concurrent queries refining toward target keys in O(log n) hops",
        "Designed join and bootstrap protocol for routing table population from seed nodes",
        "Added key-value republishing and redundant storage across k closest nodes for fault tolerance",
      ],
    },
    {
      name: "Redis Redesign",
      tech: ["Rust", "Tokio", "Redis"],
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
  ],
  teaching: [
  {
    title: "Data Structures",
    skills: "Java · Algorithms & Complexity · Scala · Git · Data Structures",
  },
  {
    title: "Web Applications",
    skills: "Python · Flask · FastAPI · REST APIs · HTTP(S) · Back-End Web Development",
  },
  {
    title: "Software Quality in Practice",
    skills: "Git · Linux · GDB · QA Engineering · Code Coverage · Trello · Make",
  },
  {
    title: "Discrete Structures",
    skills: "Logic · Proofs · Discrete Mathematics",
  },
  {
    title: "Introduction to Computer Science",
    skills: "Python",
  },
  {
    title: "Computer Organization",
    skills: "MIPS Assembly · SystemVerilog · Computer Architecture",
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
        { label: "", items: ["Axum", "Actix-web", "Tokio", "ratatui", "FastAPI", "Flask"] },
      ],
    },
    {
      category: "AI, ML & Agentic Systems",
      groups: [
        { label: "", items: ["LangGraph", "LangChain", "FAISS", "Ollama", "LangSmith", "NVIDIA OpenShell"] },
      ],
    },
    {
      category: "Protocols, APIs & Messaging",
      groups: [
        { label: "", items: ["gRPC", "RESTful APIs", "GraphQL", "WebSockets", "WebRTC", "Apache Kafka", "RabbitMQ"] },
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
      linkedin: "https://www.linkedin.com/in/oliver-kennedy-04602217/",
    },
    {
      name: "Jesse Hartloff",
      title: "Associate Professor of Teaching, State University of New York at Buffalo",
      course: "Web Applications",
      quote: "He not only demonstrated a great technical understanding of the content but was able to explain these concepts in a simple manner to students who were struggling to apply the material.",
      linkedin: "https://www.linkedin.com/in/jesse-hartloff-a8309212/",
    },
    {
      name: "Carl Alphonce",
      title: "Professor of Teaching, State University of New York at Buffalo",
      course: "Software Quality in Practice",
      quote: "He was very responsive to requests, professional in all his interactions with students and course staff, and technically competent in all the tools and processes covered in the course.",
      linkedin: "https://www.linkedin.com/in/carl-alphonce-9b7b323/",
    },
    {
      name: "Nasrin Akhter",
      title: "Assistant Professor of Teaching, State University of New York at Buffalo",
      course: "Discrete Structures",
      quote: "I was impressed by his strong work ethic, positive attitude, professionalism, and dedication. He proved himself to be an organized, efficient, and hardworking TA.",
      linkedin: "https://www.linkedin.com/in/nasrinakhter/",
    },
    {
      name: "Sean Mackay",
      title: "Assistant Professor of Computer Science, University of Oklahoma",
      course: "Introduction to Computer Science",
      quote: "Riad is one of the best individuals I have ever had the opportunity to work with. His ability to communicate complex concepts to a range of skill levels continually impressed me.",
      linkedin: "https://www.linkedin.com/in/sean-mackay-phd-784905140/",
    },
    {
      name: "Farshad Ghanei",
      title: "Associate Teaching Professor, Illinois Institute of Technology",
      course: "Computer Organization",
      quote: "I attest to Riad's work ethics, skill, performance, and communication. I do not hesitate to recommend Riad to any employer.",
      linkedin: "https://www.linkedin.com/in/farshad-ghanei/",
    },
  ],
};
