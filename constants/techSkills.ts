/**
 * A curated (not exhaustive) dictionary of common software engineering
 * skills/technologies, used to scan job description and resume text for
 * recognizable keywords. Expanding this list over time is expected and
 * safe — see docs/PROJECT_GOAL.md's ATS keyword-coverage goal.
 */
export const KNOWN_TECH_SKILLS: readonly string[] = [
  // Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Scala",
  "SQL",
  "HTML",
  "CSS",
  "HTML/CSS",

  // Frontend
  "React",
  "React.js",
  "Next.js",
  "Vue",
  "Vue.js",
  "Angular",
  "Svelte",
  "Redux",
  "React Query",
  "Tailwind CSS",
  "Bootstrap",
  "jQuery",

  // Backend
  "Node.js",
  "Express.js",
  "Nest.js",
  "FastAPI",
  "Django",
  "Flask",
  "Spring",
  "Spring Boot",
  ".NET",
  "ASP.NET",
  "Ruby on Rails",
  "Laravel",
  "GraphQL",
  "REST",
  "REST API",
  "gRPC",
  "WebSockets",
  "WebRTC",

  // Databases & storage
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "DynamoDB",
  "Elasticsearch",
  "Prisma",

  // Cloud & DevOps
  "AWS",
  "AWS EC2",
  "AWS S3",
  "AWS Amplify",
  "AWS Lambda",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "CI/CD",
  "Jenkins",
  "GitHub Actions",
  "Vercel",
  "Nginx",

  // Testing
  "Jest",
  "Playwright",
  "Cypress",
  "Mocha",
  "Unit Testing",
  "Integration Testing",
  "Swagger/OpenAPI",

  // Tools & practices
  "Git",
  "GitHub",
  "GitLab",
  "Jira",
  "Agile",
  "Scrum",
  "JWT",
  "OAuth",

  // AI / data
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "OpenAI",
  "LLM",
  "Data Analysis",
  "Pandas",
  "NumPy",
] as const;
