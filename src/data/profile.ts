export type Project = {
  /** Stable key used to attach RU/AZ translations, never rendered. */
  id: string;
  name: string;
  tech: string[];
  date?: string;
  impact?: string;
  bullets: string[];
  links?: {
    github?: string;
    /** Separate mobile-client repo, labelled with its repo name. */
    mobile?: string;
    demo?: string;
    crates?: string;
    docs?: string;
  };
  badges?: { api: string; pillLabel: string; platform: string; link?: string }[];
};

export type OpenSource = {
  name: string;
  /** Merged-PR search for the repo, so the count stays checkable. */
  url: string;
  prs: string;
  tech: string[];
  period: string;
  bullets: string[];
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
  openSource: OpenSource[];
  teaching: Teaching[];
  skills: {
    category: string;
    groups: { label: string; tier?: string; items: string[] }[];
  }[];
  testimonials: Testimonial[];
  /** Resume-only facts. Everything else in the PDF comes from the fields above. */
  resume: {
    phone: string;
    /** Project ids to include, in order. The site shows all projects; the PDF fits one page. */
    projects: string[];
    /** Bullets kept per role, by position in `experience`; every role is listed. */
    roleBullets: number[];
    /** Bullets kept per project. */
    projectBullets: number;
    /** The CV's short skills list; the site shows the full one. */
    skills: { category: string; items: string[] }[];
  };
};

export const profile: Profile = {
  hero: {
    name: 'Riad Mukhtarov',
  },

  about:
    'develops software and AI systems in Rust and Python, with a focus on distributed systems and complex infrastructure. Before that, he taught computer science at State University of New York at Buffalo. He likes complicated challenges and clean abstractions.',

  email: 'riad@riad.cc',

  links: {
    resume: '/resume/',
    linkedin: 'https://linkedin.com/in/riadmukhtarov',
    github: 'https://github.com/r14dd',
  },

  experience: [
    {
      role: 'Artificial Intelligence Engineer',
      org: 'ABB - International Bank of Azerbaijan',
      location: 'Baku, Azerbaijan',
      period: 'Apr 2026 – Present',
      bullets: [
        "Leading development of the bank's internal LangGraph document agent and agents-as-a-service platform",
        'Isolated each agent action in a per-chat sandbox (NVIDIA OpenShell, Kata on OpenShift): no egress, Landlock, audit',
        'Made it observable: Langfuse tracing per turn, a daily chat eval, and GitLab CI with lint, tests and audit',
        'Kept data in the bank: guardrails on web search, server-side spend and token limits, ETL into Postgres',
        "Integrated LibreChat as the bank's chat front end with directory sign-in and service-desk forms in chat",
      ],
    },
    {
      role: 'Head of IT (volunteer)',
      org: 'European Youth Parliament Azerbaijan',
      location: 'Baku, Azerbaijan',
      period: 'Feb 2026 – Present',
      bullets: [
        'Leading the development team on the website and member tools; owning domains, hosting, email, access',
        'Coordinating the website renewal, internal platform improvements, and new technology rollouts',
      ],
    },
    {
      role: 'Software Engineer',
      org: 'Ministry of Defense of the Republic of Azerbaijan',
      location: 'Baku, Azerbaijan',
      period: 'Jan 2025 – Jan 2026',
      bullets: [
        'Mandatory military service: built and maintained internal Linux and Python services (under NDA)',
        'The work is confidential under NDA, so no further details can be shared',
      ],
    },
    {
      role: 'Information and Communication Technology (ICT) Assistant',
      org: 'COP29 United Nations Climate Change Conference',
      location: 'Baku, Azerbaijan',
      period: 'Oct 2024 – Nov 2024',
      bullets: [
        'Ensured 99.9% uptime for IT infrastructure supporting 500+ delegates under strict SLAs',
        'Resolved real-time infrastructure and hybrid session incidents under strict availability requirements',
        'Assisted with access control, device hardening, and secure system handling',
        'Collaborated with vendors and technical teams to ensure uninterrupted operations',
      ],
    },
    {
      role: 'Head Teaching Assistant: Data Structures',
      org: 'State University of New York at Buffalo',
      location: 'Buffalo, NY',
      period: 'Aug 2022 – May 2024',
      bullets: [
        'Taught data structures and algorithms in Scala and Java to ~1000 students; managed 20 TAs',
        'Coordinated course logistics with faculty',
        'Oversaw grading with emphasis on academic integrity',
        'Provided weekly reviews and debugging support to ~200 students',
      ],
    },
    {
      role: 'Software Engineer (part-time)',
      org: 'EZ Pro Billing and Collection Inc.',
      location: 'New York, NY',
      period: 'Sep 2021 – May 2023',
      bullets: [
        'Built Python and MongoDB backends, including authentication and a task-based point allocation system',
        'Optimized WebSockets for instant sync across clients',
        'Built ADA-compliant frontend components',
      ],
    },
  ],

  projects: [
    {
      id: 'aicell',
      name: 'aicell+: Self-Service App for a Mobile Operator',
      tech: ['Django', 'Celery', 'Gemini', 'Milvus', 'React Native'],
      impact:
        'Self-service app for a mobile operator that shows each subscriber, in manats, where they overpay and fixes it in one tap through Laya, a voice assistant in Azerbaijani and English. The Expo mobile client lives in a separate repo.',
      date: 'Oct 2026',
      bullets: [
        'Built Laya, an LLM voice assistant that throws away any answer carrying a number the backend did not supply',
        'Added usage insights: eight detectors read per-day and per-app usage, catch repeat pack buys, overage, unused data and short balances before renewal, and price the fix from the live catalogue as a card with a one-tap action',
        'Built the Django REST backend: billing, tariffs, packs, SIM and credit products behind 86 documented endpoints, with one row-locked, idempotent code path for every balance change',
        "Built Laya's plan, narrate and done endpoints: the LLM picks the intent and words the sentence, the backend supplies every number",
        'Added a Gemini support assistant with a Milvus knowledge base and per-subscriber memory, streaming replies over SSE and answering voice notes with speech',
        'Built the Expo / React Native client with on-device speech-to-text and TTS, running every voice task through the same code path as a manual tap',
      ],
      links: {
        github: 'https://github.com/r14dd/aicell-api',
        mobile: 'https://github.com/r14dd/aicell-mobile',
      },
    },
    {
      id: 'tappad',
      name: 'TapPad: Tap-to-Pay for Desktop Games',
      tech: ['Rust', 'Tauri', 'ESP32', 'Xsolla', 'WebSocket'],
      impact:
        'Tap a card on a USB NFC pad, pay inside the game window, get the item: tap-to-pay for desktop games built on Xsolla. Built at the Xsolla Baku GameTech Hackathon with a 5-person team.',
      date: 'Sep 2026',
      bullets: [
        'Built the Rust (axum) server: per-card spending limits, order creation against the Xsolla Pay Station sandbox, API key kept server-side behind a PaymentProvider trait with Xsolla and Mock implementations',
        'Integrated Xsolla checkout as an iframe inside a Tauri 2 desktop game client, polling order status to completion',
        'Wired ESP32 + RC522 NFC firmware through a Rust serial-to-WebSocket bridge into a shared tappad-protocol crate with Rust and JS client SDKs',
        '114 Rust tests, clippy pedantic, no unwrap/expect/panic outside tests, CI running fmt, clippy, and cargo audit',
      ],
      links: {
        github: 'https://github.com/xsolla-baku-gametech-hackathon/team-InlandEmpire',
      },
    },
    {
      id: 'fplbot',
      name: 'fplbot: Fantasy Premier League Squad Optimizer',
      tech: ['Python', 'Fantasy Premier League', 'Markdown'],
      impact:
        'Fantasy Premier League assistant for the terminal: pulls live data from the public FPL API, projects points for every player, and picks the best legal squad, captain and transfers over a 5-gameweek horizon. Python stdlib only, no dependencies, no credentials.',
      date: 'Sep 2026',
      bullets: [
        'Projects points per player per gameweek as shrunk points-per-90 × expected minutes × fixture multiplier × availability, summed over the horizon: a transparent heuristic, not ML',
        'Builds the squad greedily, then improves it by local search with paired swaps, since the budget couples every position; enforces squad quotas, three per club and every legal formation',
        'Writes a weekly Markdown report (XI, captain, bench order, ranked transfers) with --lock, --exclude and --budget overrides and a disk cache that keeps weekly runs off the API',
      ],
      links: {
        github: 'https://github.com/r14dd/fplbot',
      },
    },
    {
      id: 'patent',
      name: 'patent',
      tech: ['Rust', 'Tokio', 'Ollama', 'ratatui', 'fastembed'],
      impact:
        'CLI that takes a plain-English dev-tool idea, searches open-source registries for existing implementations, ranks matches with local embeddings, and writes a scoped verdict via LLM.',
      date: 'Jun 2026',
      bullets: [
        'Rust CLI that checks if a dev tool exists: 19 concurrent adapters, local ranking, 500+ GitHub stars',
        'Designed integrity-scoped verdict system that never asserts absence, only reports what was found in sources checked',
        'Added interactive ratatui TUI with detail view, browser open, and structured JSON output for CI pipelines',
      ],
      links: {
        crates: 'https://crates.io/crates/patent',
        docs: 'https://docs.rs/patent',
        github: 'https://github.com/r14dd/patent',
      },
      badges: [
        {
          api: 'https://api.github.com/repos/r14dd/patent',
          pillLabel: 'stars',
          platform: 'on GitHub',
          link: 'https://github.com/r14dd/patent',
        },
        {
          api: 'https://crates.io/api/v1/crates/patent',
          pillLabel: 'downloads',
          platform: 'on crates.io',
          link: 'https://crates.io/crates/patent',
        },
      ],
    },
    {
      id: 'quorumrag',
      name: 'QuorumRAG.rs: Consensus-Based RAG',
      tech: ['Rust', 'Ollama', 'Tokio'],
      impact:
        'Multi-retriever RAG with quorum filtering requiring cross-retriever consensus before surfacing evidence. Recalls 19 of 20 answers vs 14 for the baseline.',
      date: 'May 2026',
      bullets: [
        'Built a multi-retriever ensemble with rank fusion and quorum filtering: 19/20 recall vs 14/20 baseline',
        'Published to crates.io as an installable Rust crate (cargo add quorumrag)',
        'Implemented overlapping chunk processing with 50% stride to prevent boundary-split answers',
        'Added parallel embedding with caching to optimize cold-start performance',
        'Clustered evidence via cosine-similarity centroids so the quorum vote operates on semantic groups rather than raw chunks',
      ],
      links: {
        crates: 'https://crates.io/crates/quorumrag',
        docs: 'https://docs.rs/quorumrag',
        github: 'https://github.com/r14dd/quorumRAG.rs',
      },
    },
    {
      id: 'almostaykhan',
      name: 'almostAykhan: ABB Bank RAG Chatbot',
      tech: ['Python', 'FastAPI', 'OpenAI', 'FAISS', 'Docker'],
      impact:
        "RAG chatbot answering questions exclusively from ABB Bank's public content with multilingual support and strict context-only guardrails.",
      date: 'May 2026',
      bullets: [
        'Built a two-service RAG pipeline (gateway + QA) that scrapes, chunks, and indexes bank pages via FAISS',
        'Implemented multilingual support across Azerbaijani, English, and Russian with prompt injection blocking',
        "Applied distance-gated out-of-scope detection to prevent hallucination, returning 'Bunu bilmirəm' for off-topic queries",
        'Added SQLite observability and Chart.js query analytics dashboard for monitoring chatbot usage',
      ],
      links: {
        github: 'https://github.com/r14dd/almostAykhan',
      },
    },
    {
      id: 'matchsentinel',
      name: 'MatchSentinel: Transaction Monitoring Platform',
      tech: ['Java', 'Spring Boot', 'RabbitMQ', 'PostgreSQL', 'Docker'],
      impact:
        'End-to-end transaction monitoring pipeline with event-driven scoring, async processing via RabbitMQ, and idempotent data handling.',
      date: 'Jan 2026',
      bullets: [
        'Designed event-driven architecture for scoring, notifications, and reporting',
        'Built async processing with RabbitMQ and safe reprocessing',
        'Implemented per-service databases with Liquibase migrations and environment-based configuration',
        'Deployed to AWS EC2 with Docker Compose, Linux networking, and public endpoints',
      ],
      links: {
        github: 'https://github.com/r14dd/matchsentinel',
      },
    },
    {
      id: 'raft',
      name: 'Raft-Based Consensus Algorithm',
      tech: ['Go', 'UDP', 'Protobuf'],
      impact:
        'A cluster that keeps serving through leader crashes and network partitions: up to ⌊n/2⌋ nodes can fail without a committed entry being lost.',
      date: 'May 2024',
      bullets: [
        'Handled node failures and network partitions while tolerating up to ⌊n/2⌋ server failures',
        'Implemented leader election with randomized timeouts and term-based logical clocks to prevent split votes',
        'Built log replication via AppendEntries RPC with consistency checks and quorum-based commitment',
        'Enforced safety guarantees ensuring elected leaders always contain all previously committed entries',
        'Designed custom RPC framework over UDP with Protobuf serialization, retransmission, and message deduplication',
      ],
    },
    {
      id: 'kademlia',
      name: 'Distributed Hash Table (Kademlia)',
      tech: ['Go', 'TCP', 'Protobuf'],
      impact:
        'Any key is found in O(log n) hops and stays findable as nodes join and leave, with every value held on the k closest peers.',
      date: 'Feb 2024',
      bullets: [
        'Implemented XOR-based distance metric with k-bucket routing tables for peer organization',
        'Built iterative node lookup with α concurrent queries refining toward target keys in O(log n) hops',
        'Designed join and bootstrap protocol for routing table population from seed nodes',
        'Added key-value republishing and redundant storage across k closest nodes for fault tolerance',
      ],
    },
    {
      id: 'redis',
      name: 'Redis Redesign',
      tech: ['Rust', 'Tokio', 'Redis'],
      impact:
        'Every entry expires on its TTL and dangling cross-layer references are collected, so reads stop returning stale data at no cost to the hot path.',
      date: 'Dec 2025',
      bullets: [
        'Replaced a monolithic cache with two layers: key-subkey to id mapping and id to value storage',
        'Applied TTL lifecycle control to expire stale entries predictably',
        'Implemented garbage collection to remove expired entries and dangling cross-layer references',
        'Preserved low-latency access while improving consistency in distributed workloads',
      ],
    },
  ],
  teaching: [
    {
      title: 'Data Structures',
      skills: 'Java · Algorithms & Complexity · Scala · Git · Data Structures',
    },
    {
      title: 'Web Applications',
      skills: 'Python · Flask · FastAPI · REST APIs · HTTP(S) · Back-End Web Development',
    },
    {
      title: 'Software Quality in Practice',
      skills: 'Git · Linux · GDB · QA Engineering · Code Coverage · Trello · Make',
    },
    {
      title: 'Discrete Structures',
      skills: 'Logic · Proofs · Discrete Mathematics',
    },
    {
      title: 'Introduction to Computer Science',
      skills: 'Python',
    },
    {
      title: 'Computer Organization',
      skills: 'MIPS Assembly · SystemVerilog · Computer Architecture',
    },
  ],
  skills: [
    {
      category: 'Programming Languages',
      groups: [{ label: '', items: ['Rust', 'Python', 'TypeScript', 'Go', 'C'] }],
    },
    {
      category: 'Backend & Runtimes',
      groups: [
        {
          label: '',
          items: [
            'Axum',
            'Actix-web',
            'Tokio',
            'ratatui',
            'FastAPI',
            'Django',
            'Celery',
            'Flask',
            'Node.js',
          ],
        },
      ],
    },
    {
      category: 'AI, ML & Agentic Systems',
      groups: [
        {
          label: '',
          items: [
            'LangGraph',
            'LangChain',
            'MCP',
            'Deep Agents',
            'Langfuse',
            'OpenAI API',
            'Anthropic API',
            'Gemini',
            'FAISS',
            'Milvus',
            'RAG',
            'MLflow',
            'Ollama',
            'LangSmith',
            'NVIDIA OpenShell',
          ],
        },
      ],
    },
    {
      category: 'Protocols, APIs & Messaging',
      groups: [
        {
          label: '',
          items: [
            'gRPC',
            'RESTful APIs',
            'GraphQL',
            'WebSockets',
            'WebRTC',
            'Server-Sent Events',
            'LDAP',
            'Apache Kafka',
            'RabbitMQ',
          ],
        },
      ],
    },
    {
      category: 'Databases & Persistence',
      groups: [
        { label: '', items: ['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis', 'pgvector'] },
      ],
    },
    {
      category: 'Cloud, Infrastructure & DevOps',
      groups: [
        {
          label: '',
          items: [
            'AWS',
            'Supabase',
            'Docker',
            'Kubernetes',
            'OpenShift',
            'Kata Containers',
            'GitHub Actions',
            'GitLab CI/CD',
            'Linux',
            'Linux namespaces & cgroups',
            'seccomp-BPF',
            'OpenTelemetry',
          ],
        },
      ],
    },
    {
      category: 'Testing & Quality Assurance',
      groups: [
        { label: '', items: ['Pytest', 'rstest', 'Playwright', 'Jest', 'Selenium', 'Postman'] },
      ],
    },
  ],
  openSource: [
    {
      name: 'MLflow',
      url: 'https://github.com/mlflow/mlflow/pulls?q=is%3Apr+author%3Ar14dd+is%3Amerged',
      prs: '5 merged PRs',
      tech: ['Python', 'AI Gateway'],
      period: 'Sep 2026',
      bullets: [
        "Fixed tool-call streaming and response parsing in the AI Gateway's Anthropic, Gemini and LiteLLM adapters",
      ],
    },
    {
      name: 'youki',
      url: 'https://github.com/youki-dev/youki/pulls?q=is%3Apr+author%3Ar14dd+is%3Amerged',
      prs: '4 merged PRs',
      tech: ['Rust', 'OCI runtime', 'cgroups'],
      period: 'Sep 2026',
      bullets: [
        'Fixed a D-Bus socket opened without SOCK_CLOEXEC leaking its fd into containers under systemd cgroups',
      ],
    },
  ],

  resume: {
    phone: '+994 (50) 899-8676',
    projects: ['patent', 'quorumrag', 'aicell'],
    roleBullets: [5, 1, 1, 0, 1, 2],
    projectBullets: 1,
    skills: [
      { category: 'Languages', items: ['Python', 'Rust', 'TypeScript', 'Go', 'C'] },
      {
        category: 'AI & Agents',
        items: [
          'LangGraph',
          'LangChain',
          'MCP',
          'RAG',
          'Guardrails',
          'OpenAI/Anthropic/Gemini APIs',
          'Ollama',
        ],
      },
      {
        category: 'LLMOps',
        items: ['Milvus', 'FAISS', 'MLflow', 'Langfuse', 'LangSmith', 'OpenTelemetry'],
      },
      {
        category: 'Backend & Data',
        items: [
          'FastAPI',
          'Django',
          'Celery',
          'Node.js',
          'Axum',
          'Tokio',
          'WebSockets',
          'SSE',
          'PostgreSQL',
          'Redis',
          'MongoDB',
        ],
      },
      {
        category: 'Infra & Security',
        items: [
          'Docker',
          'Kubernetes',
          'OpenShift',
          'Kata Containers',
          'AWS',
          'GitLab CI',
          'namespaces, cgroups, seccomp',
        ],
      },
    ],
  },

  testimonials: [
    {
      name: 'Oliver Kennedy',
      title: 'Associate Professor, State University of New York at Buffalo',
      course: 'Data Structures',
      headTA: true,
      quote:
        'Put him into a Project Manager/Team Lead role, and I guarantee to you that he will shine.',
      linkedin: 'https://www.linkedin.com/in/oliver-kennedy-04602217/',
    },
    {
      name: 'Jesse Hartloff',
      title: 'Associate Professor of Teaching, State University of New York at Buffalo',
      course: 'Web Applications',
      quote:
        'He not only demonstrated a great technical understanding of the content but was able to explain these concepts in a simple manner to students who were struggling to apply the material.',
      linkedin: 'https://www.linkedin.com/in/jesse-hartloff-a8309212/',
    },
    {
      name: 'Carl Alphonce',
      title: 'Professor of Teaching, State University of New York at Buffalo',
      course: 'Software Quality in Practice',
      quote:
        'He was very responsive to requests, professional in all his interactions with students and course staff, and technically competent in all the tools and processes covered in the course.',
      linkedin: 'https://www.linkedin.com/in/carl-alphonce-9b7b323/',
    },
    {
      name: 'Nasrin Akhter',
      title: 'Assistant Professor of Teaching, State University of New York at Buffalo',
      course: 'Discrete Structures',
      quote:
        'I was impressed by his strong work ethic, positive attitude, professionalism, and dedication. He proved himself to be an organized, efficient, and hardworking TA.',
      linkedin: 'https://www.linkedin.com/in/nasrinakhter/',
    },
    {
      name: 'Sean Mackay',
      title: 'Assistant Professor of Computer Science, University of Oklahoma',
      course: 'Introduction to Computer Science',
      quote:
        'Riad is one of the best individuals I have ever had the opportunity to work with. His ability to communicate complex concepts to a range of skill levels continually impressed me.',
      linkedin: 'https://www.linkedin.com/in/sean-mackay-phd-784905140/',
    },
    {
      name: 'Farshad Ghanei',
      title: 'Associate Teaching Professor, Illinois Institute of Technology',
      course: 'Computer Organization',
      quote:
        "I attest to Riad's work ethics, skill, performance, and communication. I do not hesitate to recommend Riad to any employer.",
      linkedin: 'https://www.linkedin.com/in/farshad-ghanei/',
    },
  ],
};
