import { profile } from "./profile";
import type { Profile } from "./profile";

type Labels = {
  nav: {
    experience: string;
    projects: string;
    teaching: string;
    education: string;
    skills: string;
    recommendations: string;
    connect: string;
  };
  links: {
    resume: string;
    linkedin: string;
    github: string;
  };
  headings: {
    experience: string;
    projects: string;
    teaching: string;
    education: string;
    skills: string;
    recommendations: string;
    connect: string;
  };
  eyebrows: {
    experience: string;
    projects: string;
    skills: string;
    teaching: string;
    education: string;
    recommendations: string;
  };
  heroEyebrow: string;
  connectTagline: string;
  taRole: string;
  headTARole: string;
  skillCategories: Record<string, string>;
  introLead: string;
  introTail: string;
  connectTemplate: string;
  currentlyLabel: string;
};

type EducationInfo = {
  title: string;
  meta: string;
  bullets: string[];
};

export type I18nProfile = Profile & { labels: Labels; education: EducationInfo };

export const profiles: Record<string, I18nProfile> = {
  en: {
    ...profile,
    labels: {
      nav: {
        experience: "Experience",
        projects: "Projects",
        teaching: "Teaching",
        education: "Education",
        skills: "Skills",
        recommendations: "Recommendations",
        connect: "Connect",
      },
      links: {
        resume: "Resume",
        linkedin: "LinkedIn",
        github: "GitHub",
      },
      headings: {
        experience: "Experience",
        projects: "Projects",
        teaching: "Teaching",
        education: "Education",
        skills: "Technical Skills",
        recommendations: "Recommendations",
        connect: "Connect",
      },
      introLead: "Who is",
      introTail: "",
      eyebrows: {
        experience: "Work history",
        projects: "Selected work",
        skills: "Toolbox",
        teaching: "Teaching experience",
        education: "Academic background",
        recommendations: "What colleagues say",
      },
      heroEyebrow: "AI & Software Engineer · Baku, Azerbaijan",
      connectTagline: "Let's talk.",
      taRole: "Teaching Assistant",
      headTARole: "Head Teaching Assistant",
      skillCategories: {
        "Programming Languages": "Programming Languages",
        "Backend & Runtimes": "Backend & Runtimes",
        "AI, ML & Agentic Systems": "AI, ML & Agentic Systems",
        "Communication Protocols & APIs": "Communication Protocols & APIs",
        "Messaging & Integration": "Messaging & Integration",
        "Databases & Persistence": "Databases & Persistence",
        "Cloud, Infrastructure & DevOps": "Cloud, Infrastructure & DevOps",
        "Testing & Quality Assurance": "Testing & Quality Assurance",
      },
      connectTemplate: "Reach me at {email}",
      currentlyLabel: "Currently:",
    },
    education: {
      title: "State University of New York at Buffalo — BS in Computer Science",
      meta: "Aug 2020 – May 2024 · Buffalo, New York",
      bullets: ["Awards: Undergraduate Teaching Assistant Award, Multiple Dean's List Honors"],
    },
  },
  ru: {
    ...profile,
    hero: {
      ...profile.hero,
      name: "Риад Мухтаров",
      tagline: "",
    },
    about: "разрабатывает ПО и AI-системы на Rust и Python, с акцентом на распределённые системы и сложную инфраструктуру. До этого он преподавал информатику в State University of New York at Buffalo. Это сформировало его подход к системам и умение их объяснять. Любит сложные задачи и чистые абстракции.",
    currently: "Разрабатываю AI-системы в International Bank of Azerbaijan.<br>Руковожу разработкой в European Youth Parliament Azerbaijan.",
    experience: [
      {
        role: "Инженер по искусственному интеллекту",
        org: "ABB - International Bank of Azerbaijan",
        location: "Баку, Азербайджан",
        period: "Апр 2026 – Настоящее время",
        bullets: [],
      },
      {
        role: "Руководитель команды IT‑разработки",
        org: "European Youth Parliament Azerbaijan",
        location: "Баку, Азербайджан",
        period: "Фев 2026 – Настоящее время",
        bullets: [
          "Координация обновления веб‑сайта, улучшения внутренних платформ и внедрения новых технологических решений",
        ],
      },
      {
        role: "Специалист по ИТ‑поддержке",
        org: "COP29 United Nations Climate Change Conference",
        location: "Баку, Азербайджан",
        period: "Окт 2024 – Ноя 2024",
        bullets: [
          "Обеспечил 99.9% uptime ИТ-инфраструктуры для 500 международных делегатов, соблюдая жесткие SLA в режиме реального времени",
          "Решал инциденты инфраструктуры и гибридных сессий в режиме реального времени при жестких требованиях доступности",
          "Помогал с контролем доступа, усилением устройств и безопасным обращением с системами",
          "Сотрудничал с вендорами и техническими командами для бесперебойной работы",
        ],
      },
      {
        role: "Старший ассистент преподавателя — Структуры данных",
        org: "State University of New York at Buffalo",
        location: "Buffalo, NY",
        period: "Авг 2022 – Май 2024",
        bullets: [
          "Проводил занятия по структурам данных и алгоритмам на Scala и Java для ~1000 студентов",
          "Координировал работу 20 ассистентов и организовывал учебные процессы",
          "Контролировал оценивание с акцентом на академическую честность",
          "Проводил еженедельные разборы и поддержку отладки для ~200 студентов",
        ],
      },
      {
        role: "Разработчик программного обеспечения",
        org: "EZ Pro Billing and Collection Inc.",
        location: "New York, NY",
        period: "Сен 2021 – Май 2023",
        bullets: [
          "Разрабатывал backend‑системы на Python и MongoDB с ADA‑совместимыми фронтенд‑компонентами",
          "Создал систему аутентификации и распределения баллов по задачам",
          "Оптимизировал WebSockets: снизил нагрузку сервера на 90% и внедрил мгновенную синхронизацию в распределенной системе",
        ],
      },
    ],
    projects: [
      {
        name: "QuorumRAG.rs — RAG на основе консенсуса",
        tech: profile.projects[0].tech,
        impact: "Мульти-ретриверный RAG с кворумной фильтрацией, требующей согласия между ретриверами перед выдачей результатов. Достигнут recall 95% против 70% baseline.",
        date: "Май 2026",
        bullets: [
          "Построил мульти-ретриверный ансамбль с Reciprocal Rank Fusion и кворумной фильтрацией",
          "Реализовал обработку перекрывающихся чанков с 50% шагом для предотвращения потери ответов на границах",
          "Добавил параллельное создание эмбеддингов с кэшированием для оптимизации холодного старта",
          "Собрал единый бинарный файл без зависимости от Python runtime",
        ],
        links: profile.projects[0].links,
      },
      {
        name: "almostAykhan — RAG чат-бот ABB Bank",
        tech: profile.projects[1].tech,
        impact:
          "RAG чат-бот, отвечающий исключительно на основе публичного контента ABB Bank с мультиязычной поддержкой и строгими ограничениями контекста.",
        date: "Май 2026",
        bullets: [
          "Построил двухсервисный RAG-пайплайн (API-шлюз + QA-сервис) со скрейпингом, чанкингом и индексацией через FAISS",
          "Реализовал мультиязычную поддержку (азербайджанский, английский, русский) с блокировкой prompt-инъекций",
          "Применил distance-gate для обнаружения внеконтекстных запросов — возвращает «Bunu bilmirəm» при выходе за рамки",
          "Добавил наблюдаемость через SQLite и дашборд аналитики запросов на Chart.js",
        ],
        links: profile.projects[1].links,
      },
      {
        name: "MatchSentinel — Платформа мониторинга транзакций",
        tech: profile.projects[2].tech,
        impact:
          "End-to-end pipeline мониторинга транзакций с event-driven скорингом, асинхронной обработкой через RabbitMQ и идемпотентной обработкой данных.",
        date: "Янв 2026",
        bullets: [
          "Спроектировал event‑driven архитектуру для скоринга, уведомлений и отчетности",
          "Построил асинхронность через RabbitMQ и безопасные повторные чтения",
          "Реализовал per‑service БД с миграциями Liquibase и конфигурацией по окружениям",
          "Развернул на AWS EC2 через Docker Compose, Linux‑сети и публичные сервисные endpoints",
        ],
        links: profile.projects[2].links,
      },
      {
        name: "Алгоритм консенсуса Raft",
        tech: profile.projects[3].tech,
        impact:
          "Консенсус Raft, сохраняющий согласованность при отказах узлов через лидер-элекцию и репликацию логов.",
        date: "Май 2024",
        bullets: [
          "Реализовал Raft с выбором лидера, репликацией логов и отказоустойчивостью",
          "Построил конкурентные серверные компоненты для согласованности между узлами",
        ],
      },
      {
        name: "Распределенная хеш‑таблица (Kademlia)",
        tech: profile.projects[4].tech,
        impact:
          "Kademlia DHT для устойчивого peer-discovery и O(log n) поиска в динамических сетях.",
        date: "Фев 2024",
        bullets: [
          "Реализовал peer‑to‑peer хранилище с маршрутизацией Kademlia",
          "Достиг эффективных O(log n) запросов и устойчивой маршрутизации данных",
        ],
      },
      {
        name: "Redis Redesign",
        tech: profile.projects[5].tech,
        impact:
          "Двухслойный TTL-кэш, устраняющий несогласованность устаревших данных при сохранении низкой задержки.",
        date: "Дек 2025",
        bullets: [
          "Заменил монолитный кэш на два слоя: key-subkey to id и id to value",
          "Добавил TTL-управление жизненным циклом для предсказуемого истечения данных",
          "Реализовал garbage collection для удаления просроченных записей и висячих ссылок",
          "Сохранил низкую latency при усилении консистентности в распределенной нагрузке",
        ],
      },
      {
        name: "Минималистичное портфолио",
        tech: profile.projects[6].tech,
        impact:
          "Адаптивное портфолио с сильной типографической иерархией, плавной анимацией и доступностью.",
        date: "Янв 2026",
        bullets: [
          "Спроектировал минималистичный интерфейс с сильной типографикой и читаемыми отступами",
          "Реализовал адаптивную навигацию для десктопа и мобильных",
          "Добавил микро‑анимации с учетом prefers-reduced-motion",
        ],
        links: profile.projects[6].links,
      },
    ],
    teaching: [
      {
        title: "Структуры данных",
        skills: profile.teaching[0].skills,
        bullets: [
          "Поддерживал 900+ студентов через office hours, занятия и сессии вопросов‑ответов",
          "Преподавал ключевые структуры данных и алгоритмы для решения реальных задач",
          "Помогал разбирать сложность, компромиссы и выбор структур данных",
          "Сопровождал реализацию структур данных на Java и Scala",
          "Объяснял связь между структурами и алгоритмами в дизайне систем",
        ],
      },
      {
        title: "Веб‑приложения",
        skills: profile.teaching[1].skills,
        bullets: [
          "Помогал 240 студентам строить full‑stack приложения без готовых фреймворков",
          "Объяснял HTTP/REST, маршрутизацию, шаблоны и архитектуру бекенда",
          "Проверял проекты и улучшал качество кода и практики тестирования",
          "Консультировал по развертыванию и устранению багов",
        ],
      },
      {
        title: "Качество ПО на практике",
        skills: profile.teaching[2].skills,
        bullets: [
          "Оценивал командную работу и качество ПО для 120 студентов",
          "Проверял способность проектировать, реализовывать и оценивать решения",
          "Фокусировался на корректности, тестировании, отладке и профессиональных стандартах",
          "Проводил ревью кода на предмет поддерживаемости и надежности",
        ],
      },
      {
        title: "Дискретные структуры",
        skills: profile.teaching[3].skills,
        bullets: [
          "Проводил занятия по логике, доказательствам и дискретной математике",
          "Проверял задания и помогал студентам с формальными доказательствами",
          "Поддерживал студентов в освоении ключевых концепций",
        ],
      },
      {
        title: "Основы компьютерных наук",
        skills: profile.teaching[4].skills,
        bullets: [
          "Обучал основам Python и алгоритмическому мышлению",
          "Проводил лабораторные и объяснял фундаментальные концепции",
          "Помогал студентам преодолевать сложности обучения программированию",
        ],
      },
      {
        title: "Организация компьютера",
        skills: profile.teaching[5].skills,
        bullets: [
          "Поддерживал студентов по архитектуре процессора и организации памяти",
          "Разбирал темы ALU, конвейеров и иерархий памяти",
          "Проверял задания и проводил review‑сессии",
        ],
      },
    ],
    testimonials: [
      {
        name: "Oliver Kennedy",
        title: "Доцент, State University of New York at Buffalo",
        course: "Структуры данных",
        headTA: true,
        quote: "Поставьте его на позицию Project Manager или Team Lead — я гарантирую, он проявит себя блестяще.",
      },
      {
        name: "Jesse Hartloff",
        title: "Доцент кафедры преподавания, State University of New York at Buffalo",
        course: "Веб‑приложения",
        quote: "Он не только продемонстрировал глубокое техническое понимание материала, но и умел объяснять эти концепции просто и доступно студентам, которым было трудно применить их на практике.",
      },
      {
        name: "Carl Alphonce",
        title: "Профессор кафедры преподавания, State University of New York at Buffalo",
        course: "Качество ПО на практике",
        quote: "Он оперативно реагировал на запросы, профессионально взаимодействовал со студентами и сотрудниками курса и был технически компетентен во всех инструментах и процессах курса.",
      },
      {
        name: "Nasrin Akhter",
        title: "Ассистент-профессор кафедры преподавания, State University of New York at Buffalo",
        course: "Дискретные структуры",
        quote: "Меня впечатлили его сильная трудовая этика, позитивный настрой, профессионализм и преданность делу. Он проявил себя как организованный, эффективный и трудолюбивый ассистент.",
      },
      {
        name: "Sean Mackay",
        title: "Ассистент-профессор кафедры компьютерных наук, University of Oklahoma",
        course: "Основы компьютерных наук",
        quote: "Риад — один из лучших людей, с которыми мне доводилось работать. Его способность объяснять сложные концепции людям с разным уровнем подготовки неизменно меня впечатляла.",
      },
      {
        name: "Farshad Ghanei",
        title: "Доцент кафедры преподавания, Illinois Institute of Technology",
        course: "Организация компьютера",
        quote: "Я подтверждаю трудовую этику, навыки, результативность и коммуникабельность Риада. Я без колебаний рекомендую его любому работодателю.",
      },
    ],
    labels: {
      nav: {
        experience: "Опыт",
        projects: "Проекты",
        teaching: "Преподавание",
        education: "Образование",
        skills: "Навыки",
        recommendations: "Рекомендации",
        connect: "Связь",
      },
      links: {
        resume: "Резюме",
        linkedin: "LinkedIn",
        github: "GitHub",
      },
      headings: {
        experience: "Опыт",
        projects: "Проекты",
        teaching: "Преподавание",
        education: "Образование",
        skills: "Технические навыки",
        recommendations: "Рекомендации",
        connect: "Связь",
      },
      introLead: "Кто такой",
      introTail: "",
      eyebrows: {
        experience: "История работы",
        projects: "Избранные проекты",
        skills: "Инструменты",
        teaching: "Преподавание",
        education: "Академическое образование",
        recommendations: "Отзывы коллег",
      },
      heroEyebrow: "AI & Software инженер · Баку, Азербайджан",
      connectTagline: "Давайте поговорим.",
      taRole: "Ассистент преподавателя",
      headTARole: "Старший ассистент преподавателя",
      skillCategories: {
        "Programming Languages": "Языки программирования",
        "Backend & Runtimes": "Backend и среды выполнения",
        "AI, ML & Agentic Systems": "ИИ, ML и агентные системы",
        "Communication Protocols & APIs": "Протоколы и API",
        "Messaging & Integration": "Очереди сообщений и интеграция",
        "Databases & Persistence": "Базы данных и хранилища",
        "Cloud, Infrastructure & DevOps": "Облако, инфраструктура и DevOps",
        "Testing & Quality Assurance": "Тестирование и QA",
      },
      connectTemplate: "Свяжитесь со мной: {email}",
      currentlyLabel: "Сейчас:",
    },
    education: {
      title: "State University of New York at Buffalo — Бакалавр по направлению Компьютерные Науки",
      meta: "Авг 2020 – Май 2024 · Buffalo, NY",
      bullets: ["Награды: Премия старшего ассистента преподавателя, многократные отличия списка декана"],
    },
  },
  az: {
    ...profile,
    hero: {
      ...profile.hero,
      name: "Riad Muxtarov",
      tagline: "",
    },
    about: "Rust və Python ilə proqram təminatı və AI sistemləri hazırlayır, paylanmış sistemlər və mürəkkəb infrastruktura fokuslanmaqla. Bundan əvvəl o, State University of New York at Buffalo-da kompüter elmləri tədris edib. Bu, onun sistemlər haqqında düşüncə tərzini və onları izah etmə qabiliyyətini formalaşdırıb. Mürəkkəb çətinlikləri və təmiz abstraksiyaları sevir.",
    currently: "International Bank of Azerbaijan-da AI sistemləri qururam.<br>European Youth Parliament Azerbaijan-da inkişaf komandasına rəhbərlik edirəm.",
    experience: [
      {
        role: "Süni İntellekt Mühəndisi",
        org: "ABB - International Bank of Azerbaijan",
        location: "Bakı, Azərbaycan",
        period: "Apr 2026 – indiyə kimi",
        bullets: [],
      },
      {
        role: "İT İnkişaf Komandasının Rəhbəri",
        org: "European Youth Parliament Azerbaijan",
        location: "Bakı, Azərbaycan",
        period: "Fev 2026 – indiyə kimi",
        bullets: [
          "Veb‑saytın yenilənməsi, daxili platformların təkmilləşdirilməsi və təşkilatın fəaliyyətini dəstəkləyən yeni texnoloji həllərin tətbiqi",
        ],
      },
      {
        role: "İT‑dəstək üzrə mütəxəssis",
        org: "COP29 United Nations Climate Change Conference",
        location: "Bakı, Azərbaycan",
        period: "Okt 2024 – Noy 2024",
        bullets: [
          "500+ nümayəndə üçün kritik İT infrastrukturu üzrə 99.9% uptime təmin etdim və sərt SLA‑lara əməl etdim",
          "İnfrastruktur və hibrid sessiya insidentlərini real vaxtda həll etdim",
          "Giriş nəzarəti, cihazların sərtləşdirilməsi və təhlükəsiz sistem istifadəsində kömək etdim",
          "Fasiləsiz əməliyyatlar üçün vendor və texniki komandalarla işlədim",
        ],
      },
      {
        role: "Baş tədris assistenti — Məlumat strukturları",
        org: "State University of New York at Buffalo",
        location: "Buffalo, NY",
        period: "Avq 2022 – May 2024",
        bullets: [
          "Scala və Java ilə məlumat strukturları və alqoritmlər üzrə ~1000 tələbəyə dərs keçdim",
          "20 TA‑nın işini koordinasiya etdim və kurs prosesini idarə etdim",
          "Qiymətləndirməni akademik dürüstlük üzrə nəzarət etdim",
          "Həftəlik icmallar və debugging dəstəyi göstərdim (~200 tələbə)",
        ],
      },
      {
        role: "Proqram mühəndisi",
        org: "EZ Pro Billing and Collection Inc.",
        location: "New York, NY",
        period: "Sen 2021 – May 2023",
        bullets: [
          "Python və MongoDB ilə backend sistemlər, ADA‑uyğun frontend komponentlər qurdum",
          "Autentifikasiya və tapşırıq‑əsaslı xal bölüşdürmə sistemi hazırladım",
          "WebSocket arxitekturasını optimallaşdırdım, server yükünü 90% azaltdım və ani sinxronizasiya təmin etdim",
        ],
      },
    ],
    projects: [
      {
        name: "QuorumRAG.rs — Konsensus əsaslı RAG",
        tech: profile.projects[0].tech,
        impact: "Nəticələri təqdim etməzdən əvvəl retriverlər arası konsensus tələb edən kvorum filtrasiyalı multi-retriver RAG. Baseline 70%-ə qarşı 95% recall əldə edilib.",
        date: "May 2026",
        bullets: [
          "Reciprocal Rank Fusion skorinqi və kvorum filtrasiyası ilə multi-retriver ansambl qurdum",
          "Sərhəd bölünmə cavablarının qarşısını almaq üçün 50% addımlı üst-üstə düşən chunk emalı tətbiq etdim",
          "Soyuq başlanğıc performansını optimallaşdırmaq üçün keşləmə ilə paralel embedding əlavə etdim",
          "Python runtime asılılığı olmadan vahid binar fayl istehsal etdim",
        ],
        links: profile.projects[0].links,
      },
      {
        name: "almostAykhan — ABB Bank RAG Chatbotu",
        tech: profile.projects[1].tech,
        impact:
          "ABB Bank-ın ictimai məzmunundan eksklüziv cavab verən çoxdilli dəstək və ciddi kontekst məhdudiyyətləri olan RAG chatbotu.",
        date: "May 2026",
        bullets: [
          "FAISS vasitəsilə scraping, chunking və indeksləmə ilə iki xidmətli RAG pipeline qurdum (API gateway + QA xidməti)",
          "Prompt injection bloklama ilə Azərbaycan, İngilis və Rus dillərini dəstəklədim",
          "Kontekst xaricindəki sorğuları aşkar etmək üçün distance-gate tətbiq etdim — 'Bunu bilmirəm' qaytarır",
          "SQLite müşahidə imkanı və Chart.js sorğu analitika dashboardu əlavə etdim",
        ],
        links: profile.projects[1].links,
      },
      {
        name: "MatchSentinel — Tranzaksiya monitorinq platforması",
        tech: profile.projects[2].tech,
        impact:
          "Event-driven skorinq, RabbitMQ ilə asinxron emal və idempotent məlumat emalı ilə end-to-end tranzaksiya monitorinqi pipeline-ı.",
        date: "Yan 2026",
        bullets: [
          "Skorinq, bildiriş və reportinq üçün event‑driven arxitektura qurdum",
          "RabbitMQ ilə asinxron emal və təhlükəsiz təkrar emalı təmin etdim",
          "Liquibase ilə per‑service DB və mühit‑əsaslı konfiqurasiyanı tətbiq etdim",
          "Docker Compose, Linux şəbəkəsi və public endpoint‑lərlə AWS EC2‑yə yerləşdirdim",
        ],
        links: profile.projects[2].links,
      },
      {
        name: "Raft əsaslı konsensus alqoritmi",
        tech: profile.projects[3].tech,
        impact:
          "Lider seçimi və log replikasiyası vasitəsilə node nasazlıqlarında konsistensiyanı qoruyan Raft konsensusu.",
        date: "May 2024",
        bullets: [
          "Raft lider seçimi, log repliksiyası və fault tolerance tətbiq etdim",
          "Node‑lar arasında konsistensiya üçün paralel server komponentləri qurdum",
        ],
      },
      {
        name: "Paylanmış Hash Table (Kademlia)",
        tech: profile.projects[4].tech,
        impact:
          "Dinamik şəbəkələrdə dayanıqlı peer-discovery və O(log n) axtarış üçün Kademlia DHT.",
        date: "Fev 2024",
        bullets: [
          "Kademlia marşrutlaması ilə P2P paylanmış storage sistemi qurdum",
          "O(log n) axtarış və dayanıqlı data yönləndirmə əldə etdim",
        ],
      },
      {
        name: "Redis Redesign",
        tech: profile.projects[5].tech,
        impact:
          "Aşağı gecikmə ilə köhnəlmiş məlumat uyğunsuzluğunu aradan qaldıran ikiqat TTL-ə əsaslanan cache.",
        date: "Dek 2025",
        bullets: [
          "Monolit cache-i iki laylı modelə çevirdim: key-subkey to id və id to value",
          "Məlumatların müddətini idarə etmək üçün TTL lifecycle nəzarəti tətbiq etdim",
          "Expired qeyd və asılı istinadları təmizləmək üçün garbage collection reallaşdırdım",
          "Paylanmış yüklərdə konsistensiyanı artırarkən aşağı latency-ni saxladım",
        ],
      },
      {
        name: "Minimalist Portfel",
        tech: profile.projects[6].tech,
        impact:
          "Güclü tipoqrafik iyerarxiya, hamar animasiya və əlçatanlıq-birinci dizaynlı adaptiv portfel.",
        date: "Yan 2026",
        bullets: [
          "Minimalist layout və güclü tipoqrafik iyerarxiya qurdum",
          "Desktop və mobil üçün adaptiv naviqasiya reallaşdırdım",
          "prefers-reduced-motion dəstəkli mikro‑animasiya əlavə etdim",
        ],
        links: profile.projects[6].links,
      },
    ],
    teaching: [
      {
        title: "Məlumat strukturları",
        skills: profile.teaching[0].skills,
        bullets: [
          "900+ tələbəyə office hours və təkrar sessiyalarla dəstək göstərdim",
          "Real problemlər üçün əsas data strukturlarını və alqoritmləri izah etdim",
          "Komplekslik analizi və düzgün struktur seçimi üzərində işlədim",
          "Java və Scala ilə data strukturlarının implementasiyasını izah etdim",
          "Data strukturları və alqoritmlərin sistem dizaynındakı rolunu göstərdim",
        ],
      },
      {
        title: "Veb tətbiqləri",
        skills: profile.teaching[1].skills,
        bullets: [
          "240 tələbəyə full‑stack tətbiqlər üzrə dəstək verdim",
          "HTTP/REST, routing və backend arxitekturasını izah etdim",
          "Layihələrin keyfiyyətini artırmaq üçün review etdim",
          "Deployment və debugging mövzusunda kömək etdim",
        ],
      },
      {
        title: "Proqram keyfiyyəti praktikada",
        skills: profile.teaching[2].skills,
        bullets: [
          "120 tələbənin komanda işini və proqram keyfiyyətini qiymətləndirdim",
          "Həlləri layihələndirmək, həyata keçirmək və qiymətləndirmək bacarığını yoxladım",
          "Düzgünlük, test, debugging və peşəkar standartlara fokuslandım",
          "Kodu dəstəklənə bilən və etibarlı olmaq üçün review etdim",
        ],
      },
      {
        title: "Diskret strukturlar",
        skills: profile.teaching[3].skills,
        bullets: [
          "Məntiq, sübutlar və diskret riyaziyyat üzrə dərslər keçdim",
          "Tapşırıqları yoxladım və formal sübutlarda kömək etdim",
          "Əsas konseptləri mənimsəməyə dəstək oldum",
        ],
      },
      {
        title: "Kompüter Elmlərinə giriş",
        skills: profile.teaching[4].skills,
        bullets: [
          "Python və alqoritmik düşüncə üzrə təməl dərslər keçdim",
          "Lab sessiyalarında əsas konseptləri izah etdim",
          "Proqramlaşdırma çətinliklərini aşmaqda tələbələrə kömək etdim",
        ],
      },
      {
        title: "Kompüter təşkilatı",
        skills: profile.teaching[5].skills,
        bullets: [
          "Prosessor arxitekturası və yaddaş iyerarxiyası üzrə dəstək verdim",
          "ALU, pipeline və control unit mövzularını izah etdim",
          "Tapşırıqları yoxladım və review sessiyalar keçirdim",
        ],
      },
    ],
    testimonials: [
      {
        name: "Oliver Kennedy",
        title: "Dosent, State University of New York at Buffalo",
        course: "Məlumat strukturları",
        headTA: true,
        quote: "Onu Project Manager və ya Team Lead vəzifəsinə qoyun — zəmanət verirəm ki, parlayacaq.",
      },
      {
        name: "Jesse Hartloff",
        title: "Tədris üzrə dosent, State University of New York at Buffalo",
        course: "Veb tətbiqləri",
        quote: "O, təkcə materialın texniki tərəfini dərindən başa düşməklə kifayətlənmədi, həm də bu anlayışları çətinlik çəkən tələbələrə sadə şəkildə izah edə bildi.",
      },
      {
        name: "Carl Alphonce",
        title: "Tədris üzrə professor, State University of New York at Buffalo",
        course: "Proqram keyfiyyəti praktikada",
        quote: "O, sorğulara operativ cavab verirdi, tələbələr və kurs heyəti ilə peşəkar davranırdı və kursdakı bütün alətlər və proseslərdə texniki bacarıq nümayiş etdirirdi.",
      },
      {
        name: "Nasrin Akhter",
        title: "Tədris üzrə assistent professor, State University of New York at Buffalo",
        course: "Diskret strukturlar",
        quote: "Onun güclü iş etikası, müsbət münasibəti, peşəkarlığı və fədakarlığı məni heyran etdi. O, mütəşəkkil, səmərəli və zəhmətkeş bir assistent olduğunu sübut etdi.",
      },
      {
        name: "Sean Mackay",
        title: "Kompüter elmləri üzrə assistent professor, University of Oklahoma",
        course: "Kompüter Elmlərinə giriş",
        quote: "Riad əməkdaşlıq etdiyim ən yaxşı insanlardan biridir. Mürəkkəb anlayışları müxtəlif bacarıq səviyyələrinə sadə şəkildə çatdırmaq qabiliyyəti məni daima heyran edirdi.",
      },
      {
        name: "Farshad Ghanei",
        title: "Tədris üzrə dosent, Illinois Institute of Technology",
        course: "Kompüter təşkilatı",
        quote: "Riadın iş etikasını, bacarıqlarını, nəticələrini və ünsiyyət qabiliyyətini təsdiq edirəm. Onu istənilən işəgötürənə tövsiyə etməkdə tərəddüd etmirəm.",
      },
    ],
    labels: {
      nav: {
        experience: "Təcrübə",
        projects: "Layihələr",
        teaching: "Tədris",
        education: "Təhsil",
        skills: "Bacarıqlar",
        recommendations: "Tövsiyələr",
        connect: "Əlaqə",
      },
      links: {
        resume: "CV",
        linkedin: "LinkedIn",
        github: "GitHub",
      },
      headings: {
        experience: "Təcrübə",
        projects: "Layihələr",
        teaching: "Tədris",
        education: "Təhsil",
        skills: "Texniki bacarıqlar",
        recommendations: "Tövsiyələr",
        connect: "Əlaqə",
      },
      introLead: "",
      introTail: "kimdir",
      eyebrows: {
        experience: "İş təcrübəsi",
        projects: "Seçilmiş işlər",
        skills: "Alətlər",
        teaching: "Tədris təcrübəsi",
        education: "Akademik təhsil",
        recommendations: "Həmkarların rəyləri",
      },
      heroEyebrow: "AI və Proqram Mühəndisi · Bakı, Azərbaycan",
      connectTagline: "Əlaqə saxlayaq.",
      taRole: "Tədris assistenti",
      headTARole: "Baş tədris assistenti",
      skillCategories: {
        "Programming Languages": "Proqramlaşdırma dilləri",
        "Backend & Runtimes": "Backend və Runtime",
        "AI, ML & Agentic Systems": "AI, ML və Agent sistemləri",
        "Communication Protocols & APIs": "Protokollar və API",
        "Messaging & Integration": "Mesajlaşma və İnteqrasiya",
        "Databases & Persistence": "Verilənlər bazaları",
        "Cloud, Infrastructure & DevOps": "Bulud, İnfrastruktur və DevOps",
        "Testing & Quality Assurance": "Test və Keyfiyyət Təminatı",
      },
      connectTemplate: "Əlaqə: {email}",
      currentlyLabel: "Hazırda:",
    },
    education: {
      title: "State University of New York at Buffalo — Kompüter Elmləri üzrə Bakalavr",
      meta: "Avq 2020 – May 2024 · Buffalo, NY",
      bullets: ["Mükafatlar: Baş Tədris Assistenti Mükafatı, bir neçə dəfə Dekan siyahısına daxil edilmə"],
    },
  },
};
