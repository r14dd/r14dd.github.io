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
      title: "Инженер-программист",
      tagline:
        "Открыт для ролей Software/Backend. Строю надежные, production-ready системы и event-driven архитектуры.",
    },
    experience: [
      {
        role: "Специалист по ИКТ",
        org: "COP29 United Nations Climate Change Conference",
        location: "Баку, Азербайджан",
        period: "Окт 2024 – Ноя 2024",
        bullets: [
          "Поддерживал ИКТ‑операции для 500+ международных делегатов в критически важной среде",
          "Решал инциденты инфраструктуры и гибридных сессий в реальном времени при жестких требованиях доступности",
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
        role: "Инженер‑программист",
        org: "EZ Pro Billing and Collection Inc.",
        location: "New York, NY",
        period: "Сен 2021 – Май 2023",
        bullets: [
          "Разрабатывал backend‑системы на Python и MongoDB с ADA‑совместимыми фронтенд‑компонентами",
          "Создал систему аутентификации и распределения баллов по задачам",
          "Реализовал чат на WebSocket, снизив нагрузку примерно на 90%",
        ],
      },
    ],
    projects: [
      {
        name: "MatchSentinel — Платформа мониторинга транзакций",
        tech: profile.projects[0].tech,
        impact:
          "Impact: Полный fraud‑pipeline, развернутый на AWS, с live‑дашбордом и надежной обработкой событий.",
        date: "Янв 2026",
        bullets: [
          "Спроектировал event‑driven микросервисную архитектуру для скоринга, правил, кейсов, уведомлений и отчетности",
          "Построил асинхронное взаимодействие через RabbitMQ и идемпотентных потребителей для безопасного повторного чтения",
          "Реализовал per‑service БД с миграциями Liquibase и конфигурацией по окружениям",
          "Развернул на AWS EC2 через Docker Compose, Linux‑сети и публичные сервисные endpoints",
        ],
        links: profile.projects[0].links,
      },
      {
        name: "FinFlow — Wallet API",
        tech: profile.projects[1].tech,
        impact:
          "Impact: Безопасный wallet API с JWT‑аутентификацией и проверенными потоками доступа.",
        date: "Янв 2026",
        bullets: [
          "Реализовал безопасную аутентификацию и авторизацию на JWT без состояния",
          "Спроектировал реляционные модели данных через JPA/Hibernate с оптимизированными запросами",
          "Применил практики безопасности: хэширование паролей, срок действия токенов, фильтрация запросов",
          "Написал интеграционные тесты для проверки аутентификации и защищенных эндпоинтов",
        ],
        links: profile.projects[1].links,
      },
      {
        name: "Минималистичное портфолио",
        tech: profile.projects[2].tech,
        impact:
          "Impact: Премиальное адаптивное портфолио с четкой иерархией и доступной анимацией.",
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
          "Impact: Продемонстрировал отказоустойчивое лидерство и репликацию логов в распределенном кластере.",
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
          "Impact: Масштабируемые peer‑to‑peer запросы с логарифмической маршрутизацией.",
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
        title: "Введение в информатику",
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
      { category: "Языки программирования", items: profile.skills[0].items },
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
      connectTemplate: "Свяжитесь со мной: {email} или {phone}",
    },
    education: {
      title: "State University of New York at Buffalo — Бакалавр по Computer Science",
      meta: "Авг 2020 – Май 2024 · Buffalo, NY",
      bullets: ["Награды: Премия старшего ассистента преподавателя, многократные Dean's List Honors"],
    },
  },
  az: {
    ...profile,
    hero: {
      ...profile.hero,
      title: "Proqram mühəndisi",
      tagline:
        "Software/Backend rolları üçün açığam. Etibarlı, production‑ready sistemlər və event‑driven arxitekturalar qururam.",
    },
    experience: [
      {
        role: "İKT üzrə assistent",
        org: "COP29 United Nations Climate Change Conference",
        location: "Bakı, Azərbaycan",
        period: "Okt 2024 – Noy 2024",
        bullets: [
          "500+ beynəlxalq nümayəndə üçün kritik mühitdə İKT əməliyyatlarını dəstəklədim",
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
          "WebSocket real‑vaxt çat tətbiq edib yüklənməni ~90% azaltdım",
        ],
      },
    ],
    projects: [
      {
        name: "MatchSentinel — Tranzaksiya monitorinq platforması",
        tech: profile.projects[0].tech,
        impact:
          "Impact: AWS üzərində yerləşdirilmiş, live paneli və etibarlı event emalı olan end‑to‑end fraud pipeline.",
        date: "Yan 2026",
        bullets: [
          "Skorinq, qaydalar, case, bildiriş və reportinq üçün event‑driven mikroservis arxitekturası qurdu",
          "RabbitMQ ilə asinxron xidmətlərarası əlaqə və idempotent consumer‑lar qurdu",
          "Liquibase ilə per‑service DB və mühit‑əsaslı konfiqurasiyanı tətbiq etdi",
          "Docker Compose, Linux şəbəkəsi və public endpoint‑lərlə AWS EC2‑yə yerləşdirdi",
        ],
        links: profile.projects[0].links,
      },
      {
        name: "FinFlow — Wallet API",
        tech: profile.projects[1].tech,
        impact:
          "Impact: JWT autentifikasiya ilə qorunan wallet API və təsdiqlənmiş giriş axınları.",
        date: "Yan 2026",
        bullets: [
          "JWT əsasında stateless autentifikasiya və avtorizasiya qurdu",
          "JPA/Hibernate ilə optimallaşdırılmış sorğular və relasiya modeli dizayn etdi",
          "Parol hash‑ləmə, token expiry və request filtering kimi təhlükəsizlik praktikalı tətbiq etdi",
          "Auth axınları və qorunan endpoint‑lər üçün inteqrasiya testləri yazdı",
        ],
        links: profile.projects[1].links,
      },
      {
        name: "Minimalist Portfel",
        tech: profile.projects[2].tech,
        impact:
          "Impact: Premium, adaptiv portfel — aydın iyerarxiya və əlçatan animasiya ilə.",
        date: "Yan 2026",
        bullets: [
          "Minimalist layout və güclü tipografik iyerarxiya qurdu",
          "Desktop və mobil üçün adaptiv navigasiya reallaşdırdı",
          "prefers-reduced-motion dəstəkli mikro‑animasiya əlavə etdi",
        ],
        links: profile.projects[2].links,
      },
      {
        name: "Raft əsaslı konsensus alqoritmi",
        tech: profile.projects[3].tech,
        impact:
          "Impact: Paylanmış klasterdə lider seçimi və log repliksiyasını nümayiş etdirdi.",
        date: "May 2024",
        bullets: [
          "Raft lider seçimi, log repliksiyası və fault tolerance tətbiq etdi",
          "Node‑lar arasında konsistensiya üçün paralel server komponentləri qurdu",
        ],
      },
      {
        name: "Paylanmış Hash Table (Kademlia)",
        tech: profile.projects[4].tech,
        impact:
          "Impact: Logaritmik marşrutlama ilə skalabil P2P sorğular.",
        date: "Fev 2024",
        bullets: [
          "Kademlia marşrutlaması ilə P2P paylanmış storage sistemi qurdu",
          "O(log n) axtarış və dayanıqlı data yönləndirmə əldə etdi",
        ],
      },
    ],
    teaching: [
      {
        title: "Məlumat strukturları",
        skills: profile.teaching[0].skills,
        bullets: [
          "900+ tələbəyə office hours və təkrar sessiyalarla dəstək göstərdi",
          "Real problemlər üçün əsas data strukturlarını və alqoritmləri izah etdi",
          "Komplekslik analizi və düzgün struktur seçimi üzərində işlədi",
          "Java və Scala ilə data strukturlarının implementasiyasını izah etdi",
          "Data strukturları və alqoritmlərin sistem dizaynındakı rolunu göstərdi",
        ],
      },
      {
        title: "Veb tətbiqləri",
        skills: profile.teaching[1].skills,
        bullets: [
          "240 tələbəyə full‑stack tətbiqlər üzrə dəstək verdi",
          "HTTP/REST, routing və backend arxitekturasını izah etdi",
          "Layihələrin keyfiyyətini artırmaq üçün review etdi",
          "Deployment və debugging mövzusunda kömək etdi",
        ],
      },
      {
        title: "Diskret strukturlar",
        skills: profile.teaching[2].skills,
        bullets: [
          "Məntiq, sübutlar və diskret riyaziyyat üzrə dərslər keçdi",
          "Tapşırıqları yoxladı və formal sübutlarda kömək etdi",
          "Əsas konseptləri mənimsəməyə dəstək oldu",
        ],
      },
      {
        title: "İnformatikaya giriş",
        skills: profile.teaching[3].skills,
        bullets: [
          "Python və alqoritmik düşüncə üzrə təməl dərslər keçdi",
          "Lab sessiyalarında əsas konseptləri izah etdi",
          "Proqramlaşdırma çətinliklərini aşmaqda tələbələrə kömək etdi",
        ],
      },
      {
        title: "Kompüter təşkilatı",
        skills: profile.teaching[4].skills,
        bullets: [
          "Prosessor arxitekturası və yaddaş iyerarxiyası üzrə dəstək verdi",
          "ALU, pipeline və control unit mövzularını izah etdi",
          "Tapşırıqları yoxladı və review sessiyalar keçirdi",
        ],
      },
    ],
    skills: [
      { category: "Proqramlaşdırma dilləri", items: profile.skills[0].items },
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
        reading: "Oxu",
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
      introLead: "Kimdir",
      connectTemplate: "Əlaqə: {email} və ya {phone}",
    },
    education: {
      title: "State University of New York at Buffalo — Computer Science üzrə bakalavr",
      meta: "Avq 2020 – May 2024 · Buffalo, NY",
      bullets: ["Mükafatlar: Baş Tədris Asisstenti Mükafatı, dəfələrlə Dean's List Honors"],
    },
  },
  es: {
    ...profile,
    hero: {
      ...profile.hero,
      title: "Ingeniero de software",
      tagline:
        "Abierto a roles de Software/Backend. Construyo sistemas confiables, production‑ready y arquitecturas event‑driven.",
    },
    experience: [
      {
        role: "Asistente de TIC",
        org: "COP29 United Nations Climate Change Conference",
        location: "Bakú, Azerbaiyán",
        period: "Oct 2024 – Nov 2024",
        bullets: [
          "Respaldé operaciones de TIC para 500+ delegados internacionales en un entorno crítico",
          "Resolví incidentes de infraestructura y sesiones híbridas en tiempo real bajo alta disponibilidad",
          "Apoyé control de acceso, hardening de dispositivos y manejo seguro de sistemas",
          "Colaboré con vendors y equipos técnicos para asegurar operaciones continuas",
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
          "Implementé chat en tiempo real con WebSocket, reduciendo carga ~90%",
        ],
      },
    ],
    projects: [
      {
        name: "MatchSentinel — Plataforma de monitoreo de transacciones",
        tech: profile.projects[0].tech,
        impact:
          "Impact: Pipeline completo de fraude desplegado en AWS con dashboard en vivo y procesamiento fiable.",
        date: "Ene 2026",
        bullets: [
          "Diseñé una arquitectura de microservicios event‑driven para scoring, reglas, casos, notificaciones y reporting",
          "Construí comunicación asíncrona con RabbitMQ e idempotent consumers",
          "Implementé BD por servicio con migraciones Liquibase y configuración por entorno",
          "Desplegué en AWS EC2 con Docker Compose, redes Linux y endpoints públicos",
        ],
        links: profile.projects[0].links,
      },
      {
        name: "FinFlow — Wallet API",
        tech: profile.projects[1].tech,
        impact:
          "Impact: Wallet API seguro con autenticación JWT y flujos verificados.",
        date: "Ene 2026",
        bullets: [
          "Implementé autenticación y autorización JWT sin estado",
          "Diseñé modelos relacionales con JPA/Hibernate y consultas optimizadas",
          "Apliqué buenas prácticas: hashing de contraseñas, expiración de tokens y filtros",
          "Desarrollé pruebas de integración para endpoints protegidos",
        ],
        links: profile.projects[1].links,
      },
      {
        name: "Portafolio minimalista",
        tech: profile.projects[2].tech,
        impact:
          "Impact: Portafolio premium y responsive con jerarquía clara y animación accesible.",
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
          "Impact: Consenso tolerante a fallos con elección de líder y replicación de logs.",
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
          "Impact: Búsquedas P2P escalables con enrutamiento logarítmico.",
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
      { category: "Lenguajes de programación", items: profile.skills[0].items },
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
      connectTemplate: "Contáctame en {email} o {phone}",
    },
    education: {
      title: "State University of New York at Buffalo — Licenciatura en Computer Science",
      meta: "Ago 2020 – May 2024 · Buffalo, NY",
      bullets: ["Premios: Undergraduate Teaching Assistant Award, múltiples Dean's List Honors"],
    },
  },
};
