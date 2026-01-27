export type Project = {
  name: string;
  tech: string[];
  date?: string;
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
};


export const profile: Profile = {
  hero: {
    name: "Riad Mukhtarov",
    title: "Software Engineer",
    tagline:
      "Riad is an engineer building reliable software with a focus in distributed systems.",
  },

  links: {
    resume: "/resume.pdf",
    linkedin: "https://linkedin.com/in/riadmukhtarov",
    github: "https://github.com/r14dd",
  },

  experience: [
    {
      role: "Information Communication Technology Assistant",
      org: "COP29 United Nations Climate Change Conference",
      location: "Baku, Azerbaijan",
      period: "Oct 2024 – Nov 2024",
      bullets: [
        "Supported ICT operations for 500+ UN delegates across network, AV, and collaboration systems",
        "Resolved hybrid session issues in real time, preventing communication delays",
        "Improved system security through access controls, device hardening, and data handling",
        "Deployed and optimized hardware/software with vendors to increase reliability",
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
      name: "MatchSentinel",
      tech: [
        "Java",
        "Spring Boot",
        "RabbitMQ",
        "PostgreSQL",
        "Liquibase",
        "React",
        "TypeScript",
        "Docker",
      ],
      date: "Jan 2026",
      bullets: [
        "Built a fraud pipeline with REST APIs and RabbitMQ across AI, rules, cases, notifications, and reporting",
        "Implemented per-service persistence with Liquibase and idempotent reporting updates for reliable event handling",
        "Delivered a live analyst dashboard with filters, drill-downs, and a pipeline simulator for end-to-end flow",
      ],
      links: {
        github: "https://github.com/r14dd/MatchSentinel",
      },
    },
    {
      name: "FinFlow Wallet API",
      tech: ["Java", "Spring Boot", "JWT", "MySQL", "JPA"],
      date: "Jan 2026",
      bullets: [
        "Implemented secure JWT-based authentication and authorization",
        "Designed relational data models with JPA/Hibernate",
        "Applied security best practices including hashing and token expiration",
        "Developed integration tests for protected endpoints",
      ],
      links: {
        github: "https://github.com/r14dd/FinFlow",
      },
    },
    {
      name: "RAFT-based Consensus Algorithm",
      tech: ["Go", "UDP", "Protobuf"],
      date: "May 2024",
      bullets: [
        "Implemented Raft consensus including leader election and log replication",
        "Built fault-tolerant coordination ensuring consistency across nodes",
        "Engineered concurrent server logic handling failures and client requests",
      ],
    },
    {
      name: "Distributed Hash Table (Kademlia)",
      tech: ["Go", "TCP", "Protobuf"],
      date: "Feb 2024",
      bullets: [
        "Built a peer-to-peer distributed hash table using Kademlia routing",
        "Implemented recursive node discovery for dynamic networks",
        "Designed Protobuf-based messaging for efficient data retrieval",
      ],
    },
    {
      name: "RL Environment Algorithm",
      tech: ["Python", "Gymnasium", "NumPy", "Matplotlib"],
      date: "Nov 2023",
      bullets: [
        "Designed a custom Gym-compliant reinforcement learning environment",
        "Implemented SARSA, Q-learning, and Double Q-learning algorithms",
        "Analyzed agent performance under varying reward and learning conditions",
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
};