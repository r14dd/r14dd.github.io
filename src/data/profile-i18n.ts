import { profile } from "./profile";
import type { Profile } from "./profile";

type Labels = {
  nav: {
    experience: string;
    projects: string;
    teaching: string;
    education: string;
    skills: string;
    reading: string;
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
    reading: string;
    connect: string;
  };
  introLead: string;
  introTail: string;
  connectTemplate: string;
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
        reading: "Reading",
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
        reading: "Reading",
        connect: "Connect",
      },
      introLead: "Who is",
      introTail: "",
      connectTemplate: "Reach me at {email} or {phone}",
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
      title: "Software Engineer | Backend & Distributed Systems",
      tagline:
        "Software Engineer | Backend & Distributed Systems. Специализируюсь на проектировании высоконагруженных event-driven систем и отказоустойчивых микросервисных архитектур. Превращаю сложные академические концепции в масштабируемый production-ready код.",
    },
    experience: [
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
        name: "MatchSentinel — Платформа мониторинга транзакций",
        tech: profile.projects[0].tech,
        impact:
          "Спроектировал и развернул end-to-end pipeline мониторинга транзакций. Внедрил принципы Clean Architecture и асинхронную обработку через RabbitMQ, обеспечив строгую консистентность данных и защиту от дублирования (Idempotency).",
        date: "Янв 2026",
        bullets: [
          "Спроектировал event‑driven архитектуру для скоринга, уведомлений и отчетности",
          "Построил асинхронность через RabbitMQ и безопасные повторные чтения",
          "Реализовал per‑service БД с миграциями Liquibase и конфигурацией по окружениям",
          "Развернул на AWS EC2 через Docker Compose, Linux‑сети и публичные сервисные endpoints",
        ],
        links: profile.projects[0].links,
      },
      {
        name: "FinFlow — Wallet API",
        tech: profile.projects[1].tech,
        impact:
          "Безопасный wallet API с JWT‑аутентификацией и проверенными потоками доступа.",
        date: "Янв 2026",
        bullets: [
          "Реализовал безопасную аутентификацию и авторизацию на JWT (stateless)",
          "Спроектировал реляционные модели данных через JPA/Hibernate с оптимизированными запросами",
          "Применил практики безопасности: хэширование паролей, время жизни токенов (TTL), фильтрация запросов",
          "Написал интеграционные тесты для проверки аутентификации и защищенных эндпоинтов",
        ],
        links: profile.projects[1].links,
      },
      {
        name: "Минималистичное портфолио",
        tech: profile.projects[2].tech,
        impact:
          "Премиальное адаптивное портфолио с четкой иерархией и адаптивной анимацией.",
        date: "Янв 2026",
        bullets: [
          "Спроектировал минималистичный интерфейс с сильной типографикой и читаемыми отступами",
          "Реализовал адаптивную навигацию для десктопа и мобильных",
          "Добавил микро‑анимации с учетом prefers-reduced-motion",
        ],
        links: profile.projects[2].links,
      },
      {
        name: "Алгоритм консенсуса Raft",
        tech: profile.projects[3].tech,
        impact:
          "Глубокая реализация консенсуса Raft: лидер-элекция, репликация логов и отказоустойчивость для сохранения согласованности при сбоях.",
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
          "Построил Kademlia‑DHT для устойчивого peer‑discovery и O(log n) поиска в динамических сетях.",
        date: "Фев 2024",
        bullets: [
          "Реализовал peer‑to‑peer хранилище с маршрутизацией Kademlia",
          "Достиг эффективных O(log n) запросов и устойчивой маршрутизации данных",
        ],
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
        title: "Дискретные структуры",
        skills: profile.teaching[2].skills,
        bullets: [
          "Проводил занятия по логике, доказательствам и дискретной математике",
          "Проверял задания и помогал студентам с формальными доказательствами",
          "Поддерживал студентов в освоении ключевых концепций",
        ],
      },
      {
        title: "Основы компьютерных наук",
        skills: profile.teaching[3].skills,
        bullets: [
          "Обучал основам Python и алгоритмическому мышлению",
          "Проводил лабораторные и объяснял фундаментальные концепции",
          "Помогал студентам преодолевать сложности обучения программированию",
        ],
      },
      {
        title: "Организация компьютера",
        skills: profile.teaching[4].skills,
        bullets: [
          "Поддерживал студентов по архитектуре процессора и организации памяти",
          "Разбирал темы ALU, конвейеров и иерархий памяти",
          "Проверял задания и проводил review‑сессии",
        ],
      },
    ],
    skills: [
      {
        category: "Языки программирования",
        items: [
          "Java",
          "Python",
          "Rust",
          "Go (базовый уровень)",
          "JavaScript (базовый уровень)",
          "Scala (базовый уровень)",
          "C (базовый уровень)",
        ],
      },
      { category: "Backend и фреймворки", items: profile.skills[1].items },
      { category: "Архитектура и концепции", items: profile.skills[2].items },
      { category: "Сообщения и интеграции", items: profile.skills[3].items },
      { category: "Базы данных и хранение", items: profile.skills[4].items },
      { category: "Облако и инфраструктура", items: profile.skills[5].items },
      { category: "Тестирование и инструменты", items: profile.skills[6].items },
    ],
    reading: {
      title: "Чтение",
      description:
        "Я читаю этих авторов последние 3–4 года; их структура повествования, поведение людей под ограничениями и неоднозначность помогают моделировать реальные системы.",
      items: [
        { author: "Эрих Мария Ремарк *", quote: "Мы становимся не такими, какими хотим быть, а такими, какие мы есть." },
        { author: "Михаил Булгаков", quote: "Рукописи не горят." },
        { author: "Шарлотта Бронте", quote: "Я не птица; и никакая сеть не удержит меня." },
        { author: "Чак Паланик", quote: "Будущее будет лучше завтра." },
        { author: "Эмиль Золя", quote: "Истина в пути, и ничто её не остановит." },
      ],
    },
    labels: {
      nav: {
        experience: "Опыт",
        projects: "Проекты",
        teaching: "Преподавание",
        education: "Образование",
        skills: "Навыки",
        reading: "Чтение",
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
        reading: "Чтение",
        connect: "Связь",
      },
      introLead: "Кто такой",
      introTail: "",
      connectTemplate: "Свяжитесь со мной: {email} или {phone}",
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
      title: "Software Engineer | Backend & Distributed Systems",
      tagline:
        "Software Engineer | Backend & Distributed Systems. Yüksək yüklü event-driven sistemlərin və dayanıqlı mikroservis arxitekturaların dizaynında ixtisaslaşıram. Mürəkkəb akademik konseptləri miqyaslana bilən, production-ready koda çevirirəm.",
    },
    experience: [
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
        name: "MatchSentinel — Tranzaksiya monitorinq platforması",
        tech: profile.projects[0].tech,
        impact:
          "End-to-end tranzaksiya monitorinqi pipeline‑ını dizayn edib yerləşdirdim. Clean Architecture prinsiplərini və RabbitMQ ilə asinxron emalı tətbiq edərək ciddi məlumat konsistensiyası və dublikatdan qorunma (idempotency) təmin etdim.",
        date: "Yan 2026",
        bullets: [
          "Skorinq, bildiriş və reportinq üçün event‑driven arxitektura qurdum",
          "RabbitMQ ilə asinxron emal və təhlükəsiz təkrar emalı təmin etdim",
          "Liquibase ilə per‑service DB və mühit‑əsaslı konfiqurasiyanı tətbiq etdim",
          "Docker Compose, Linux şəbəkəsi və public endpoint‑lərlə AWS EC2‑yə yerləşdirdim",
        ],
        links: profile.projects[0].links,
      },
      {
        name: "FinFlow — Wallet API",
        tech: profile.projects[1].tech,
        impact:
          "JWT autentifikasiya ilə qorunan wallet API və təsdiqlənmiş giriş axınları.",
        date: "Yan 2026",
        bullets: [
          "JWT əsasında stateless autentifikasiya və avtorizasiya qurdum",
          "JPA/Hibernate ilə optimallaşdırılmış sorğular və relasiya modeli dizayn etdim",
          "Parol hash‑ləmə, token TTL və request filtering kimi təhlükəsizlik praktikalı tətbiq etdim",
          "Auth axınları və qorunan endpoint‑lər üçün inteqrasiya testləri yazdım",
        ],
        links: profile.projects[1].links,
      },
      {
        name: "Minimalist Portfel",
        tech: profile.projects[2].tech,
        impact:
          "Premium, adaptiv portfel — aydın iyerarxiya və əlçatan animasiya ilə.",
        date: "Yan 2026",
        bullets: [
          "Minimalist layout və güclü tipoqrafik iyerarxiya qurdum",
          "Desktop və mobil üçün adaptiv naviqasiya reallaşdırdım",
          "prefers-reduced-motion dəstəkli mikro‑animasiya əlavə etdim",
        ],
        links: profile.projects[2].links,
      },
      {
        name: "Raft əsaslı konsensus alqoritmi",
        tech: profile.projects[3].tech,
        impact:
          "Raft konsensusu üzrə dərin reallaşdırma: lider seçimi, log repliksiyası və nasazlıqlara davamlılıq.",
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
          "Dinamik şəbəkələr üçün dayanıqlı peer‑discovery və O(log n) axtarış təmin edən Kademlia‑DHT.",
        date: "Fev 2024",
        bullets: [
          "Kademlia marşrutlaması ilə P2P paylanmış storage sistemi qurdum",
          "O(log n) axtarış və dayanıqlı data yönləndirmə əldə etdim",
        ],
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
        title: "Diskret strukturlar",
        skills: profile.teaching[2].skills,
        bullets: [
          "Məntiq, sübutlar və diskret riyaziyyat üzrə dərslər keçdim",
          "Tapşırıqları yoxladım və formal sübutlarda kömək etdim",
          "Əsas konseptləri mənimsəməyə dəstək oldum",
        ],
      },
      {
        title: "İnformatikaya giriş",
        skills: profile.teaching[3].skills,
        bullets: [
          "Python və alqoritmik düşüncə üzrə təməl dərslər keçdim",
          "Lab sessiyalarında əsas konseptləri izah etdim",
          "Proqramlaşdırma çətinliklərini aşmaqda tələbələrə kömək etdim",
        ],
      },
      {
        title: "Kompüter təşkilatı",
        skills: profile.teaching[4].skills,
        bullets: [
          "Prosessor arxitekturası və yaddaş iyerarxiyası üzrə dəstək verdim",
          "ALU, pipeline və control unit mövzularını izah etdim",
          "Tapşırıqları yoxladım və review sessiyalar keçirdim",
        ],
      },
    ],
    skills: [
      {
        category: "Proqramlaşdırma dilləri",
        items: [
          "Java",
          "Python",
          "Rust",
          "Go (təməl)",
          "C (təməl)",
          "JavaScript (təməl)",
          "Scala (təməl)",
        ],
      },
      { category: "Backend və framework‑lər", items: profile.skills[1].items },
      { category: "Arxitektura və konseptlər", items: profile.skills[2].items },
      { category: "Messaging və inteqrasiya", items: profile.skills[3].items },
      { category: "Verilənlər bazası", items: profile.skills[4].items },
      { category: "Cloud və infrastruktur", items: profile.skills[5].items },
      { category: "Test və alətlər", items: profile.skills[6].items },
    ],
    reading: {
      title: "Oxu",
      description:
        "Aşağıdakı müəllifləri 3–4 ildir oxuyuram; onların narrativ strukturu və məhdudiyyətlər altında davranışları real sistemləri modelləşdirmək üçün faydalıdır.",
      items: [
        { author: "Erich Maria Remarque *", quote: "Biz olmaq istədiyimiz kimi deyil, olduğumuz kimi oluruq." },
        { author: "Mikhail Bulgakov", quote: "Əlyazmalar yanmır." },
        { author: "Charlotte Brontë", quote: "Mən quş deyiləm; heç bir tor məni əsir etməz." },
        { author: "Chuck Palahniuk", quote: "Gələcək sabah daha yaxşı olacaq." },
        { author: "Émile Zola", quote: "Həqiqət yoldadır və onu heç nə dayandıra bilməz." },
      ],
    },
    labels: {
      nav: {
        experience: "Təcrübə",
        projects: "Layihələr",
        teaching: "Tədris",
        education: "Təhsil",
        skills: "Bacarıqlar",
        reading: "Ədəbiyyat",
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
        reading: "Ədəbiyyat",
        connect: "Əlaqə",
      },
      introLead: "kimdir",
      introTail: "",
      connectTemplate: "Əlaqə: {email} və ya {phone}",
    },
    education: {
      title: "State University of New York at Buffalo — Kompüter elmləri üzrə Bakalavr",
      meta: "Avq 2020 – May 2024 · Buffalo, NY",
      bullets: ["Mükafatlar: Baş Tədris Assistenti Mükafatı, bir neçə dəfə Dekan siyahısına daxil edilmə"],
    },
  },
  es: {
    ...profile,
    hero: {
      ...profile.hero,
      title: "Software Engineer | Backend & Distributed Systems",
      tagline:
        "Software Engineer | Backend & Distributed Systems. Me especializo en diseñar sistemas event-driven de alta carga y arquitecturas de microservicios tolerantes a fallos. Transformo conceptos académicos complejos en código escalable y production-ready.",
    },
    experience: [
      {
        role: "Especialista en TI",
        org: "COP29 United Nations Climate Change Conference",
        location: "Bakú, Azerbaiyán",
        period: "Oct 2024 – Nov 2024",
        bullets: [
          "Garanticé el funcionamiento ininterrumpido de infraestructura crítica de TI para 500+ delegados internacionales, con 99.9% de uptime en sesiones híbridas bajo SLA estrictos y tiempo real",
          "Resolví incidentes de infraestructura y sesiones híbridas en tiempo real bajo alta disponibilidad",
          "Apoyé control de acceso, hardening de dispositivos y manejo seguro de sistemas",
          "Colaboré con proveedores y equipos técnicos para asegurar operaciones continuas",
        ],
      },
      {
        role: "Asistente principal — Estructuras de datos",
        org: "State University of New York at Buffalo",
        location: "Buffalo, NY",
        period: "Ago 2022 – May 2024",
        bullets: [
          "Enseñé estructuras de datos y algoritmos en Scala y Java a ~1000 estudiantes",
          "Coordiné 20 asistentes y la logística del curso",
          "Supervisé evaluaciones con enfoque en integridad académica",
          "Realicé revisiones semanales y soporte de debugging para ~200 estudiantes",
        ],
      },
      {
        role: "Ingeniero de software",
        org: "EZ Pro Billing and Collection Inc.",
        location: "New York, NY",
        period: "Sep 2021 – May 2023",
        bullets: [
          "Construí sistemas backend con Python y MongoDB y componentes frontend ADA",
          "Desarrollé autenticación y asignación de puntos por tareas",
          "Optimicé la arquitectura de mensajería con WebSockets, reduje la carga del servidor en 90% y aseguré sincronización instantánea de datos en un sistema distribuido",
        ],
      },
    ],
    projects: [
      {
        name: "MatchSentinel — Plataforma de monitoreo de transacciones",
        tech: profile.projects[0].tech,
        impact:
          "Diseñé y desplegué un pipeline end-to-end de monitoreo de transacciones. Apliqué principios de Clean Architecture y procesamiento asíncrono con RabbitMQ, garantizando consistencia estricta e idempotencia.",
        date: "Ene 2026",
        bullets: [
          "Diseñé una arquitectura event‑driven para scoring, notificaciones y reportes",
          "Construí procesamiento asíncrono con RabbitMQ y re‑procesamiento seguro",
          "Implementé BD por servicio con migraciones Liquibase y configuración por entorno",
          "Desplegué en AWS EC2 con Docker Compose, redes Linux y endpoints públicos",
        ],
        links: profile.projects[0].links,
      },
      {
        name: "FinFlow — Wallet API",
        tech: profile.projects[1].tech,
        impact:
          "Wallet API seguro con autenticación JWT y flujos verificados.",
        date: "Ene 2026",
        bullets: [
          "Implementé autenticación y autorización JWT sin estado",
          "Diseñé modelos relacionales con JPA/Hibernate y consultas optimizadas",
          "Apliqué buenas prácticas: hashing de contraseñas, TTL de tokens y filtros",
          "Desarrollé pruebas de integración para endpoints protegidos",
        ],
        links: profile.projects[1].links,
      },
      {
        name: "Portafolio minimalista",
        tech: profile.projects[2].tech,
        impact:
          "Portafolio premium y responsive con jerarquía clara y animación accesible.",
        date: "Ene 2026",
        bullets: [
          "Diseñé un layout minimalista con jerarquía tipográfica fuerte",
          "Implementé navegación responsive para desktop y móvil",
          "Añadí micro‑animaciones respetando prefers-reduced-motion",
        ],
        links: profile.projects[2].links,
      },
      {
        name: "Algoritmo de consenso Raft",
        tech: profile.projects[3].tech,
        impact:
          "Implementación profunda de Raft: elección de líder, replicación de logs y tolerancia a fallos para mantener consistencia.",
        date: "May 2024",
        bullets: [
          "Implementé Raft con elección de líder, replicación de logs y tolerancia a fallos",
          "Construí componentes concurrentes para consistencia entre nodos",
        ],
      },
      {
        name: "Tabla hash distribuida (Kademlia)",
        tech: profile.projects[4].tech,
        impact:
          "Implementé una DHT Kademlia para descubrimiento de nodos y búsquedas O(log n) en redes dinámicas.",
        date: "Feb 2024",
        bullets: [
          "Implementé almacenamiento P2P con enrutamiento Kademlia",
          "Logré búsquedas O(log n) y ruteo resiliente de datos",
        ],
      },
    ],
    teaching: [
      {
        title: "Estructuras de datos",
        skills: profile.teaching[0].skills,
        bullets: [
          "Apoyé a 900+ estudiantes con office hours y sesiones de repaso",
          "Enseñé estructuras y algoritmos clave para problemas reales",
          "Guié análisis de complejidad y selección de estructuras",
          "Apoyé implementaciones en Java y Scala",
          "Expliqué la relación entre estructuras y algoritmos en diseño de sistemas",
        ],
      },
      {
        title: "Aplicaciones web",
        skills: profile.teaching[1].skills,
        bullets: [
          "Ayudé a 240 estudiantes a construir apps full‑stack",
          "Expliqué HTTP/REST, routing y arquitectura backend",
          "Revisé proyectos para mejorar calidad y pruebas",
          "Asistí con deployment y debugging",
        ],
      },
      {
        title: "Estructuras discretas",
        skills: profile.teaching[2].skills,
        bullets: [
          "Impartí lógica, pruebas y matemáticas discretas",
          "Corregí tareas y apoyé con pruebas formales",
          "Guié la comprensión de conceptos clave",
        ],
      },
      {
        title: "Introducción a la informática",
        skills: profile.teaching[3].skills,
        bullets: [
          "Enseñé fundamentos de Python y pensamiento algorítmico",
          "Dirigí laboratorios y reforcé conceptos base",
          "Ayudé a superar barreras de aprendizaje",
        ],
      },
      {
        title: "Organización de computadores",
        skills: profile.teaching[4].skills,
        bullets: [
          "Apoyé temas de arquitectura de CPU y organización de memoria",
          "Revisé ALU, pipeline y control units",
          "Califiqué tareas y conduje sesiones de repaso",
        ],
      },
    ],
    skills: [
      {
        category: "Lenguajes de programación",
        items: [
          "Java",
          "Python",
          "Rust",
          "Go (básico)",
          "C (básico)",
          "JavaScript (básico)",
          "Scala (básico)",
        ],
      },
      { category: "Backend y frameworks", items: profile.skills[1].items },
      { category: "Arquitectura y conceptos", items: profile.skills[2].items },
      { category: "Mensajería e integración", items: profile.skills[3].items },
      { category: "Bases de datos y persistencia", items: profile.skills[4].items },
      { category: "Cloud e infraestructura", items: profile.skills[5].items },
      { category: "Testing y herramientas", items: profile.skills[6].items },
    ],
    reading: {
      title: "Lectura",
      description:
        "He leído a los autores de abajo durante 3–4 años; su estructura narrativa y ambigüedad son útiles para modelar problemas reales.",
      items: [
        { author: "Erich Maria Remarque *", quote: "No llegamos a ser como queremos, sino como somos." },
        { author: "Mijaíl Bulgákov", quote: "Los manuscritos no arden." },
        { author: "Charlotte Brontë", quote: "No soy un pájaro; ninguna red me atrapa." },
        { author: "Chuck Palahniuk", quote: "El futuro será mejor mañana." },
        { author: "Émile Zola", quote: "La verdad está en marcha y nada la detendrá." },
      ],
    },
    labels: {
      nav: {
        experience: "Experiencia",
        projects: "Proyectos",
        teaching: "Docencia",
        education: "Educación",
        skills: "Habilidades",
        reading: "Lectura",
        connect: "Contacto",
      },
      links: {
        resume: "CV",
        linkedin: "LinkedIn",
        github: "GitHub",
      },
      headings: {
        experience: "Experiencia",
        projects: "Proyectos",
        teaching: "Docencia",
        education: "Educación",
        skills: "Habilidades técnicas",
        reading: "Lectura",
        connect: "Contacto",
      },
      introLead: "Quién es",
      introTail: "",
      connectTemplate: "Contáctame en {email} o {phone}",
    },
    education: {
      title: "State University of New York at Buffalo — Ciencias de la Computación",
      meta: "Ago 2020 – May 2024 · Buffalo, NY",
      bullets: ["Premios: Undergraduate Teaching Assistant Award, múltiples menciones en la Dean's List"],
    },
  },
};
