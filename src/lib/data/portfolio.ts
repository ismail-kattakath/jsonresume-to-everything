import { ContactInfo, Experience, Skill, Project } from "@/types/portfolio";

export const contactInfo: ContactInfo = {
  name: "Ismail Kattakath",
  title: "Principal Software Engineer",
  location: "24-242 John Garland Blvd, Etobicoke, ON M9V 1N8",
  phone: "+1 (647) 225-2878",
  email: "ismail@kattakath.com",
  github: "github.com/ismail-kattakath",
  linkedin: "linkedin.com/in/ismailkattakath",
  website: "ismail.kattakath.com"
};

export const summary = "Principal Software Engineer with 15+ years of experience in full-stack web development across modern JavaScript ecosystems, specializing in SSO/federated authentication systems, CI/CD pipelines, and cloud-native distributed architectures. Currently architecting and optimizing production-ready AI inference and RAG systems, centralized MCP Gateways, multi-agent LLM workflows, and scalable generative pipelines.";

export const skills: Skill[] = [
  {
    category: "AI/ML Stack",
    items: ["RAG Systems", "Multi-Agent LLM Workflows", "Generative AI Pipelines",
            "Hugging Face Transformers", "Knowledge Graphs", "NER Models",
            "MCP Server Gateways", "Google Vertex AI", "Claude Code", "Gemini CLI", "Cursor"]
  },
  {
    category: "Cloud Services",
    items: ["Google Cloud (Vertex AI, GKE)", "AWS (Lambda, S3, EC2)",
            "DigitalOcean", "Vercel", "Cloudflare Workers/R2", "MongoDB Atlas"]
  },
  {
    category: "Authentication & Security",
    items: ["OAuth 2.0", "OpenID Connect (OIDC)", "SAML 2.0", "PKCE", "JWT",
            "Auth0", "Keycloak", "Basic Auth", "Bearer Token"]
  },
  {
    category: "DevOps & CI/CD",
    items: ["Docker", "Docker Compose", "Kubernetes", "GitHub Actions",
            "Terraform", "GitLab CI", "Ansible", "Vagrant", "Act"]
  },
  {
    category: "Backend & APIs",
    items: ["Node.js", "Express", "RESTful APIs", "GraphQL", "Microservices",
            "SOAP/XML", "Swagger/OpenAPI"]
  },
  {
    category: "Programming / Scripting",
    items: ["JavaScript", "TypeScript", "Python", "Bash"]
  },
  {
    category: "Databases",
    items: ["Supabase", "PostgreSQL", "MongoDB", "MySQL", "MS SQL",
            "Redis", "Neo4j", "Qdrant", "Chroma"]
  },
  {
    category: "Protocols",
    items: ["WebSocket", "WebRTC", "Server-Sent Events", "HTTP/HTTPS"]
  },
  {
    category: "Web & Mobile UI",
    items: ["Next.js", "ReactJS", "Angular", "TailwindCSS", "React Native", "Flutter", "Expo"]
  }
];

export const experience: Experience[] = [
  {
    title: "Principal Software Engineer",
    company: "Silver Creek Insights Inc.",
    location: "Remote",
    duration: "Aug 2024 - Present",
    description: [
      "Aloshy.ai: B2B AI-as-a-Service APIs for media manipulation—resizing, enhancement, style transfer, object removal, and format conversion",
      "Architected scalable, modular GenAI inference infrastructure using Kubernetes, supporting multiple diffusion and LLM models across production environments",
      "Continuously optimized generative AI workflows through model evaluation and pipeline refinement, improving output quality, reducing inference latency by 40%, and cutting operational costs by 25%",
      "Set up centralized Model Control Protocol (MCP) gateway and aggregator, serving secure internal and curated third-party AI model endpoints"
    ],
    technologies: ["Google Vertex AI", "GKE", "Docker", "Kubernetes", "StableDiffusion",
                  "FLUX", "Hugging Face", "OAuth2.0", "MCP Protocol", "Python", "Node.js"]
  },
  {
    title: "Senior Software Engineer",
    company: "Homewood Health Inc.",
    location: "Guelph, ON",
    duration: "Oct 2017 - July 2024",
    description: [
      "Homeweb.ca: Canada's leading digital mental health provider, delivering EFAP and CBT solutions to hundreds of thousands of employees nationwide",
      "Inherited and revitalized an abandoned, undocumented MEAN stack application, transforming it into a maintainable, production-ready web platform with 99.5% uptime",
      "Rebuilt authentication system implementing OAuth 2.0 PKCE flow for SSO integration with Microsoft Identity Platform",
      "Collaborated with federated vendors to configure and troubleshoot SAML 2.0 authentication, enabling seamless user login across 5+ partner organizations",
      "Led complete frontend migration from AngularJS to Next.js upon framework EOL, preserving existing UI/UX and API compatibility",
      "Established comprehensive DevOps practices including automated testing, CI/CD pipelines (reducing deployment time from 4 hours to 20 minutes), containerization, monitoring, and backup systems",
      "Introduced development standards encompassing coding conventions, linting, code reviews, documentation, and incident management processes, reducing production incidents by 65%"
    ],
    technologies: ["Next.js", "ReactJS", "Node.js", "MongoDB", "AngularJS", "Express",
                  "SAML 2.0", "OAuth 2.0", "PKCE", "Microsoft Identity", "Docker", "AWS", "CI/CD"]
  },
  {
    title: "Lead Software Engineer",
    company: "Etuper Technologies Pvt. Ltd.",
    location: "India",
    duration: "Apr 2016 - Aug 2017",
    description: [
      "Brilliant Rewards: Complete hospitality software suite—dashboard, mobile and web apps—featuring loyalty programs, marketing automation, booking integration, and analytics",
      "Collaborated with stakeholders to gather requirements, create user stories, design wireframes, and develop functional prototypes",
      "Managed sprint planning, daily standups, backlog prioritization, and blocker resolution to ensure continuous delivery",
      "Designed normalized database schemas, optimized SQL queries and indexing strategies, and implemented stored procedures with comprehensive test coverage",
      "Led development of scalable microservices architecture with containerized, discoverable APIs following OpenAPI specifications",
      "Delivered multiple client applications including AngularJS web platforms and cross-platform mobile solutions"
    ],
    technologies: ["AngularJS", "Node.js", "Express", "MySQL", "MongoDB", "Docker",
                  "Microservices", "OpenAPI", "Ionic", "React Native"]
  },
  {
    title: "Software Engineer",
    company: "RM plc.",
    location: "India",
    duration: "Jun 2011 - Mar 2016",
    description: [
      "RM Integris: School MIS system featuring student management, grade tracking, attendance monitoring, parent portals, and performance analytics",
      "Implemented OpenAPI/Swagger bridging layer to modernize legacy SOAP APIs for RESTful client consumption",
      "Prototyped AngularJS interface to decouple presentation layer from legacy Struts JSP architecture",
      "Maintained load-balanced Linux VM clusters hosting distributed web, application, and database tiers",
      "Mentored interns and onboarded new team members through technical guidance and knowledge transfer"
    ],
    technologies: ["Java", "Struts", "JSP", "AngularJS", "SOAP", "REST", "OpenAPI",
                  "MySQL", "Linux", "Tomcat", "Apache"]
  },
  {
    title: "Junior Software Engineer",
    company: "Posibolt Solutions Pvt. Ltd.",
    location: "India",
    duration: "Jul 2010 - Jan 2011",
    description: [
      "Posibolt: Adaptable cloud ERP solution serving key retail businesses across global industry segments",
      "Created UI mockups based on SRS specifications and converted approved designs into responsive HTML/CSS templates",
      "Developed integration test cases and implemented browser automation using Selenium WebDriver",
      "Authored user documentation including help articles, user guides, FAQs, and product website content"
    ],
    technologies: ["HTML", "CSS", "JavaScript", "jQuery", "Selenium WebDriver",
                  "Java", "JSP"]
  }
];

export const projects: Project[] = [
  {
    name: "AI Infrastructure & Model Deployment Platform",
    description: "Micro-SaaS platform providing image and video manipulation services through optimized AI model inference APIs",
    technologies: ["Google Vertex AI", "Kubernetes", "Docker", "StableDiffusion", "FLUX", "OAuth2.0"],
    highlights: [
      "Deployed production-ready inference APIs for multiple AI models",
      "Achieved reduced computational overhead with improved response times",
      "Implemented secure MCP Server Gateways with OAuth2.0 authentication"
    ]
  },
  {
    name: "Homeweb.ca Portal",
    description: "Employee and Family Assistance Program portal for corporations, built with MEAN stack and migrated to React",
    technologies: ["ReactJS", "NextJS", "Node.js", "MongoDB", "SAML2", "OAuth2.0"],
    highlights: [
      "Successfully migrated from AngularJS to ReactJS",
      "Integrated with multiple identity providers using SAML2",
      "Scaled MongoDB infrastructure to Atlas with high availability"
    ]
  },
  {
    name: "Brilliant Rewards Platform",
    description: "Comprehensive hospitality business software suite with digital loyalty program and marketing tools",
    technologies: ["AngularJS", "Node.js", "Express", "LoopBack", "Ionic", "OAuth2.0"],
    highlights: [
      "Led development of 4 cross-platform applications and 7 web portals",
      "Implemented RESTful API backend with microservices architecture",
      "Built native and cross-platform mobile applications"
    ]
  }
];