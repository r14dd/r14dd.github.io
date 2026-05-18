export type Project = {
  name: string;
  tech: string[];
  date?: string;
  impact?: string;
  bullets: string[];
  links?: {
    github?: string;
    demo?: string;
  };
};

export type Teaching = {
  title: string;
  skills: string;
  bullets: string[];
};


export type SkillGroup = {
  label: string;
  tier?: 'core' | 'familiar';
  items: string[];
};

export type SkillCategory = {
  category: string;
  groups: SkillGroup[];
};

export type Profile = {
  hero: {
    name: string;
    title: string;
    tagline: string;
  };
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
  skills: SkillCategory[];
  reading: {
    title: string;
    description: string;
    items: {
      author: string;
      quote: string;
    }[];
  };
};


export const profile: Profile = {
  hero: {
    name: "Riad Mukhtarov",
    title: "AI Engineer | Backend & Distributed Systems",
    tagline:
      "AI Engineer | Backend & Distributed Systems. I design and deploy scalable AI-powered systems, working closely with data scientists to bring models from experimentation to production. I specialize in high-load event-driven architectures, fault-tolerant microservices, and turning complex research into reliable, production-grade systems.",
  },

  links: {
    resume: "/resume.pdf",
    linkedin: "https://linkedin.com/in/riadmukhtarov",
    github: "https://github.com/r14dd",
  },

  experience: [
    {
      role: "Artificial Intelligence Engineer",
      org: "ABB",
      location: "Baku, Azerbaijan",
      period: "Apr 2026 – Present",
      bullets: [],
    },
    {
      role: "Head of IT Development Team",
      org: "EYP Azerbaijan",
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
        "Impact: Designed and deployed an end-to-end transaction monitoring pipeline. Applied Clean Architecture and asynchronous processing via RabbitMQ, ensuring strong data consistency and protection against duplication (idempotency).",
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
      name: "FinFlow — Wallet API",
      tech: ["Java", "Spring Boot", "Spring Security", "JWT", "MySQL", "JPA"],
      impact: "Impact: Secured wallet API with JWT auth, guarded endpoints, and verified access flows.",
      date: "Jan 2026",
      bullets: [
        "Implemented secure authentication and authorization using JWT-based stateless sessions",
        "Designed relational data models using JPA/Hibernate with optimized repository queries",
        "Applied security best practices including password hashing, token TTL, and request filtering",
        "Developed integration tests to validate authentication flows and protected endpoints",
      ],
      links: {
        github: "https://github.com/r14dd/finflow",
      },
    },
    {
      name: "Redis Redesign",
      tech: [
        "Redis",
        "Distributed Caching",
        "TTL",
        "Garbage Collection",
        "Low Latency",
      ],
      impact:
        "Impact: Redesigned a distributed Redis cache into a two-layer TTL-aware model, removing stale-data inconsistency while preserving low-latency behavior.",
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
      impact: "Impact: Built a premium, responsive portfolio with clear hierarchy and accessibility-first motion.",
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
    {
      name: "Raft-Based Consensus Algorithm",
      tech: ["Go", "UDP", "Protobuf"],
      impact:
        "Impact: Implemented Raft consensus to preserve consistency under failures, focusing on leader election, log replication, and fault tolerance.",
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
        "Impact: Built a Kademlia-based DHT for resilient peer discovery and O(log n) lookups in dynamic networks.",
      date: "Feb 2024",
      bullets: [
        "Implemented a peer-to-peer distributed storage system using Kademlia routing",
        "Achieved efficient O(log n) lookups and resilient data routing across nodes",
      ],
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
    skills: "Python · Django · REST APIs · HTTP(S) · Back-End Web Development",
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
        { label: "Core", tier: "core", items: ["Rust", "Python", "Go", "C", "Java"] },
        { label: "Familiar", tier: "familiar", items: ["Scala", "JavaScript"] },
      ],
    },
    {
      category: "Systems & Linux",
      groups: [
        { label: "OS Internals", items: ["Process Management", "Memory Management", "File Systems (ext4, ZFS)", "System Calls"] },
        { label: "Shell & Scripting", items: ["Bash/Zsh", "POSIX scripting", "Sed", "Awk", "Grep"] },
        { label: "Performance & Monitoring", items: ["htop/btop", "strace", "lsof", "systemd", "TCP/IP", "DNS", "IPTables"] },
        { label: "Security", items: ["SSH/OpenSSH", "GPG", "chmod/chown", "Firewalls"] },
      ],
    },
    {
      category: "Backend & Runtimes",
      groups: [
        { label: "Rust Ecosystem", items: ["Axum", "Actix-web", "Rocket", "Ratatui"] },
        { label: "Python Ecosystem", items: ["FastAPI", "Flask"] },
        { label: "JVM & JS", items: ["Spring Boot", "Node.js"] },
      ],
    },
    {
      category: "AI, ML & Agentic Systems",
      groups: [
        { label: "Orchestration & Agents", items: ["LangGraph", "LangChain", "DeepAgents"] },
        { label: "Inference & Performance", items: ["Ollama", "NVIDIA"] },
        { label: "Data Science", items: ["Pandas", "NumPy"] },
        { label: "Evaluation & Observability", items: ["LangFuse", "LangSmith"] },
        { label: "AI Architecture", items: ["RAG"] },
      ],
    },
    {
      category: "Architecture & Concepts",
      groups: [
        { label: "Distributed Systems", items: ["Microservices", "Event-Driven Architecture", "Idempotent Consumers"] },
        { label: "Design Patterns", items: ["Clean Architecture", "Domain-Driven Design"] },
        { label: "Methodologies", items: ["TDD", "BDD"] },
        { label: "Infrastructure Patterns", items: ["Serverless", "Distributed Locking", "Consensus Algorithms"] },
      ],
    },
    {
      category: "Communication Protocols & APIs",
      groups: [
        { label: "Inter-service", items: ["gRPC", "Webhooks"] },
        { label: "Web & Real-time", items: ["REST APIs", "GraphQL", "WebSockets", "WebRTC"] },
      ],
    },
    {
      category: "Messaging & Integration",
      groups: [
        { label: "Distributed Logs & Streaming", items: ["Apache Kafka", "Azure Event Hubs"] },
        { label: "Message Brokers", items: ["RabbitMQ", "Google Cloud Pub/Sub"] },
      ],
    },
    {
      category: "Databases & Persistence",
      groups: [
        { label: "Relational", items: ["PostgreSQL", "MySQL", "CockroachDB", "SQLite"] },
        { label: "NoSQL & In-Memory", items: ["MongoDB", "Cassandra", "Redis", "Memcached"] },
        { label: "Vector & Search", items: ["Weaviate", "pgvector", "Elasticsearch"] },
        { label: "Migration", items: ["Liquibase"] },
      ],
    },
    {
      category: "Cloud, Infrastructure & DevOps",
      groups: [
        { label: "Platforms", items: ["AWS", "GCP", "DigitalOcean", "Supabase"] },
        { label: "Containerization", items: ["Docker", "OrbStack", "Kubernetes"] },
        { label: "CI/CD", items: ["GitHub Actions", "GitLab CI/CD", "Jenkins"] },
      ],
    },
    {
      category: "Testing & Quality Assurance",
      groups: [
        { label: "Unit & Integration", items: ["Pytest", "Jest", "JUnit", "rstest"] },
        { label: "Environment & E2E", items: ["Testcontainers", "Selenium", "Postman"] },
      ],
    },
    {
      category: "Developer Tooling & Ecosystem",
      groups: [
        { label: "IDEs & Editors", items: ["VS Code", "JetBrains", "Emacs", "Zed"] },
        { label: "Terminal & Shell", items: ["Ghostty", "Oh My Zsh"] },
        { label: "Frontend & 3D", items: ["Astro", "React", "Three.js"] },
        { label: "AI-Assisted Dev", items: ["Claude Code CLI"] },
        { label: "Version Control", items: ["Git", "GitHub", "GitLab"] },
      ],
    },
  ],
  reading: {
    title: "Reading",
    description:
      "I’ve been reading the writers below for the past 3–4 years; their narrative structure, human behavior under constraints, and ambiguity are useful lenses for modeling real‑world problems.",
    items: [
      {
        author: "Erich Maria Remarque *",
        quote: "We become not as we want to be, but as we are.",
      },
      {
        author: "Mikhail Bulgakov",
        quote: "Manuscripts don't burn.",
      },
      {
        author: "Charlotte Brontë",
        quote: "I am no bird; and no net ensnares me.",
      },
      {
        author: "Chuck Palahniuk",
        quote: "The future will be better tomorrow.",
      },
      {
        author: "Émile Zola",
        quote: "Truth is on the march, and nothing will stop it.",
      },
    ],
  },
};
