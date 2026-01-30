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
  skills: {
    category: string;
    items: string[];
  }[];
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
    title: "Software Engineer",
    tagline:
      "Open to Software/Backend roles. Building reliable, production-ready systems and event-driven architectures.",
  },

  links: {
    resume: "/resume.pdf",
    linkedin: "https://linkedin.com/in/riadmukhtarov",
    github: "https://github.com/r14dd",
  },

  experience: [
    {
      role: "Information and Communication Technology (ICT) Assistant",
      org: "COP29 United Nations Climate Change Conference",
      location: "Baku, Azerbaijan",
      period: "Oct 2024 – Nov 2024",
      bullets: [
        "Supported ICT operations for 500+ international delegates in a mission-critical environment",
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
        "Implemented WebSocket-based real-time chat, reducing workload by ~90%",
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
      impact: "Impact: End-to-end fraud pipeline deployed on AWS with live dashboard + reliable event processing.",
      date: "Jan 2026",
      bullets: [
        "Designed an event-driven microservices architecture spanning scoring, rules, cases, notifications, and reporting",
        "Built async inter-service communication with RabbitMQ and idempotent consumers for safe reprocessing",
        "Implemented per-service databases with Liquibase migrations plus environment-based configuration",
        "Deployed to AWS EC2 using Docker Compose, Linux networking, and public service endpoints",
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
        "Applied security best practices including password hashing, token expiration, and request filtering",
        "Developed integration tests to validate authentication flows and protected endpoints",
      ],
      links: {
        github: "https://github.com/r14dd/finflow",
      },
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
      impact: "Impact: Demonstrated fault-tolerant leader election and log replication in a distributed cluster.",
      date: "May 2024",
      bullets: [
        "Implemented Raft consensus with leader election, log replication, and fault tolerance",
        "Built concurrent server components to maintain consistency across distributed nodes",
      ],
    },
    {
      name: "Distributed Hash Table (Kademlia)",
      tech: ["Go", "TCP", "Protobuf"],
      impact: "Impact: Achieved scalable peer-to-peer lookups with logarithmic routing performance.",
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
      items: ["Java", "Python", "Rust", "Go (familiar)", "C (familiar)", "JavaScript (familiar)", "Scala (familiar)"],
    },
    {
      category: "Backend & Frameworks",
      items: ["Spring Boot", "Spring Security", "REST APIs", "JWT Authentication", "FastAPI", "Flask"],
    },
    {
      category: "Architecture & Concepts",
      items: ["Microservices Architecture", "Event-Driven Systems", "Asynchronous Messaging", "Idempotent Consumers", "Distributed Systems"],
    },
    {
      category: "Messaging & Integration",
      items: ["RabbitMQ", "AMQP", "Inter-Service Communication"],
    },
    {
      category: "Databases & Persistence",
      items: ["PostgreSQL", "MySQL", "MongoDB", "JPA/Hibernate", "Liquibase", "SQL Query Design"],
    },
    {
      category: "Cloud & Infrastructure",
      items: ["AWS EC2", "Linux", "Docker", "Docker Compose", "Environment-Based Configuration", "SSH", "Networking Basics"],
    },
    {
      category: "Testing & Tooling",
      items: ["JUnit", "Testcontainers", "Integration Testing", "Git", "GitHub", "CI/CD Basics"],
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
