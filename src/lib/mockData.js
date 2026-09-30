// SkillGraph AI — Mock Data Store
// Used throughout the app for demo purposes — no external API keys needed

export const MOCK_USER = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@dev.io',
  avatar: 'AC',
  title: 'Full Stack Developer',
  location: 'San Francisco, CA',
  resumeScore: 82,
  totalSkills: 24,
  jobMatches: 18,
  learningProgress: 67,
};

export const MOCK_SKILLS = [
  { id: '1', name: 'React', proficiency: 90, source: 'resume', category: 'Frontend' },
  { id: '2', name: 'TypeScript', proficiency: 82, source: 'github', category: 'Language' },
  { id: '3', name: 'Node.js', proficiency: 78, source: 'resume', category: 'Backend' },
  { id: '4', name: 'Python', proficiency: 70, source: 'github', category: 'Language' },
  { id: '5', name: 'PostgreSQL', proficiency: 65, source: 'resume', category: 'Database' },
  { id: '6', name: 'GraphQL', proficiency: 60, source: 'github', category: 'API' },
  { id: '7', name: 'Docker', proficiency: 55, source: 'resume', category: 'DevOps' },
  { id: '8', name: 'Redis', proficiency: 50, source: 'leetcode', category: 'Database' },
  { id: '9', name: 'AWS', proficiency: 45, source: 'resume', category: 'Cloud' },
  { id: '10', name: 'Next.js', proficiency: 85, source: 'github', category: 'Frontend' },
  { id: '11', name: 'TailwindCSS', proficiency: 92, source: 'github', category: 'Frontend' },
  { id: '12', name: 'MongoDB', proficiency: 60, source: 'resume', category: 'Database' },
  { id: '13', name: 'Kubernetes', proficiency: 30, source: 'manual', category: 'DevOps' },
  { id: '14', name: 'CI/CD', proficiency: 55, source: 'github', category: 'DevOps' },
  { id: '15', name: 'System Design', proficiency: 65, source: 'leetcode', category: 'Architecture' },
  { id: '16', name: 'Data Structures', proficiency: 75, source: 'leetcode', category: 'CS Fundamentals' },
  { id: '17', name: 'REST APIs', proficiency: 88, source: 'resume', category: 'API' },
  { id: '18', name: 'Git', proficiency: 95, source: 'github', category: 'Tools' },
  { id: '19', name: 'Jest', proficiency: 72, source: 'github', category: 'Testing' },
  { id: '20', name: 'Figma', proficiency: 40, source: 'manual', category: 'Design' },
  { id: '21', name: 'Vue.js', proficiency: 45, source: 'resume', category: 'Frontend' },
  { id: '22', name: 'Java', proficiency: 50, source: 'leetcode', category: 'Language' },
  { id: '23', name: 'Prisma', proficiency: 70, source: 'github', category: 'Database' },
  { id: '24', name: 'Framer Motion', proficiency: 68, source: 'github', category: 'Frontend' },
];

export const MOCK_JOBS = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Stripe',
    location: 'Remote',
    type: 'Full-time',
    salary: '$140k - $180k',
    matchScore: 84,
    logo: 'S',
    color: '#6366f1',
    requirements: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'AWS', 'Docker'],
    description: "Build and maintain Stripe's core dashboard UI serving millions of users.",
    posted: '2 days ago',
    applicants: 234,
    matchedSkills: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
    missingSkills: ['AWS', 'Docker'],
    improvementAreas: ['TypeScript (increase to 90)', 'AWS (increase to 70)'],
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'Vercel',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$160k - $200k',
    matchScore: 78,
    logo: 'V',
    color: '#06b6d4',
    requirements: ['Next.js', 'React', 'Node.js', 'TypeScript', 'Kubernetes', 'CI/CD'],
    description: 'Work on the Vercel deployment infrastructure and developer experience.',
    posted: '1 day ago',
    applicants: 412,
    matchedSkills: ['Next.js', 'React', 'Node.js', 'TypeScript', 'CI/CD'],
    missingSkills: ['Kubernetes'],
    improvementAreas: ['Kubernetes (add to profile)', 'System Design'],
  },
  {
    id: '3',
    title: 'Backend Engineer — Platform',
    company: 'Linear',
    location: 'Remote',
    type: 'Full-time',
    salary: '$130k - $170k',
    matchScore: 71,
    logo: 'L',
    color: '#8b5cf6',
    requirements: ['Node.js', 'PostgreSQL', 'Redis', 'GraphQL', 'Docker', 'System Design'],
    description: "Scale Linear's backend platform infrastructure handling real-time sync.",
    posted: '3 days ago',
    applicants: 187,
    matchedSkills: ['Node.js', 'PostgreSQL', 'Redis', 'GraphQL'],
    missingSkills: ['Docker', 'System Design'],
    improvementAreas: ['Docker proficiency', 'Distributed Systems'],
  },
  {
    id: '4',
    title: 'AI/ML Engineer',
    company: 'Anthropic',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$200k - $280k',
    matchScore: 54,
    logo: 'A',
    color: '#f59e0b',
    requirements: ['Python', 'PyTorch', 'LLMs', 'CUDA', 'MLOps', 'AWS', 'Docker'],
    description: 'Research and deploy large language models at scale.',
    posted: '5 days ago',
    applicants: 891,
    matchedSkills: ['Python', 'AWS', 'Docker'],
    missingSkills: ['PyTorch', 'LLMs', 'CUDA', 'MLOps'],
    improvementAreas: ['Python proficiency (from 70 to 90+)', 'ML Frameworks'],
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'HashiCorp',
    location: 'Remote',
    type: 'Full-time',
    salary: '$120k - $160k',
    matchScore: 47,
    logo: 'H',
    color: '#10b981',
    requirements: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD', 'Linux'],
    description: 'Build and manage cloud infrastructure and deployment pipelines.',
    posted: '1 week ago',
    applicants: 145,
    matchedSkills: ['Docker', 'AWS', 'CI/CD'],
    missingSkills: ['Kubernetes', 'Terraform', 'Linux'],
    improvementAreas: ['Kubernetes', 'Infrastructure as Code'],
  },
  {
    id: '6',
    title: 'React Native Engineer',
    company: 'Figma',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$135k - $175k',
    matchScore: 66,
    logo: 'F',
    color: '#f43f5e',
    requirements: ['React', 'React Native', 'TypeScript', 'JavaScript', 'Figma'],
    description: "Build cross-platform mobile apps for Figma's growing mobile presence.",
    posted: '4 days ago',
    applicants: 321,
    matchedSkills: ['React', 'TypeScript'],
    missingSkills: ['React Native'],
    improvementAreas: ['React Native (extend React knowledge)', 'Mobile architecture'],
  },
];

export const MOCK_LEARNING_RESOURCES = {
  React: [
    { title: 'React 18 Complete Course', platform: 'YouTube', instructor: 'Traversy Media', duration: '12h', difficulty: 'Intermediate', rating: 4.9, url: '#', color: '#ef4444' },
    { title: 'React Patterns & Best Practices', platform: 'Udemy', instructor: 'Maximilian S.', duration: '18h', difficulty: 'Advanced', rating: 4.8, url: '#', color: '#7c3aed' },
  ],
  Docker: [
    { title: 'Docker & Kubernetes: The Complete Guide', platform: 'Udemy', instructor: 'Stephen Grider', duration: '22h', difficulty: 'Beginner', rating: 4.7, url: '#', color: '#2563eb' },
    { title: 'Docker Official Docs Walkthrough', platform: 'Documentation', instructor: 'Docker Inc.', duration: '5h', difficulty: 'Beginner', rating: 4.9, url: '#', color: '#0891b2' },
  ],
  AWS: [
    { title: 'AWS Solutions Architect Course', platform: 'YouTube', instructor: 'FreeCodeCamp', duration: '16h', difficulty: 'Intermediate', rating: 4.8, url: '#', color: '#ef4444' },
    { title: 'AWS Free Tier Projects', platform: 'GitHub', instructor: 'Open Source', duration: '10h', difficulty: 'Intermediate', rating: 4.6, url: '#', color: '#16a34a' },
  ],
  Kubernetes: [
    { title: 'Kubernetes Beginner to Advanced', platform: 'Udemy', instructor: 'Mumshad Mannambeth', duration: '14h', difficulty: 'Intermediate', rating: 4.8, url: '#', color: '#7c3aed' },
  ],
  Python: [
    { title: 'Python for Everybody Specialization', platform: 'YouTube', instructor: 'Dr. Chuck', duration: '20h', difficulty: 'Beginner', rating: 5.0, url: '#', color: '#ef4444' },
  ],
  'System Design': [
    { title: 'System Design Interview — Insider Guide', platform: 'GitHub', instructor: 'ByteByteGo', duration: '8h', difficulty: 'Advanced', rating: 4.9, url: '#', color: '#16a34a' },
    { title: 'System Design Fundamentals', platform: 'YouTube', instructor: 'Gaurav Sen', duration: '10h', difficulty: 'Advanced', rating: 4.8, url: '#', color: '#ef4444' },
  ],
};

export const MOCK_INTEGRATIONS = [
  { id: 'github', name: 'GitHub', icon: '⬡', connected: true, stats: { repos: 48, stars: 312, contributions: 1847 }, color: '#f0f6fc', category: 'Coding' },
  { id: 'leetcode', name: 'LeetCode', icon: 'L', connected: true, stats: { solved: 287, easy: 142, medium: 116, hard: 29 }, color: '#fbb040', category: 'Coding' },
  { id: 'hackerrank', name: 'HackerRank', icon: 'H', connected: false, stats: null, color: '#2ec866', category: 'Coding' },
  { id: 'codeforces', name: 'Codeforces', icon: 'C', connected: false, stats: null, color: '#1c62c8', category: 'Coding' },
  { id: 'hackerearth', name: 'HackerEarth', icon: 'E', connected: false, stats: null, color: '#4753a4', category: 'Coding' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'in', connected: true, stats: { connections: 843, endorsements: 127 }, color: '#0a66c2', category: 'Professional' },
  { id: 'naukri', name: 'Naukri', icon: 'N', connected: false, stats: null, color: '#ff7555', category: 'Professional' },
];

export const MOCK_CHAT_RESPONSES = {
  skills: "Based on your skill graph, you're strongest in **React** (90%) and **Git** (95%). Your weakest areas are **Kubernetes** (30%) and **Figma** (40%). I'd recommend focusing on **AWS** and **Docker** to unlock more backend roles.",
  jobs: "Your top job match is **Stripe's Senior Frontend role** at **84%**. You're missing Docker and AWS proficiency — learning these two could push your match to **94%**. That's the highest-ROI upskilling you can do right now.",
  resume: "Your resume scores **82/100**. Key improvements: 1) Add quantified impact to your Node.js projects (e.g., 'reduced API latency by 40%'), 2) Add your LeetCode stats to your profile, 3) Mention your Docker experience more prominently.",
  default: "Great question! Based on your profile, I'd suggest focusing on cloud infrastructure skills — specifically **AWS** and **Docker**. These appear in **68%** of your target job postings but you currently have lower proficiency in them. Want me to build a personalized learning path?",
};

export const MOCK_RESUME_SUGGESTIONS = [
  { id: 1, type: 'impact', original: 'Developed REST APIs for the platform', suggested: 'Architected and deployed 15+ RESTful APIs serving 50K daily active users, reducing response time by 35%', severity: 'high' },
  { id: 2, type: 'keyword', original: 'Worked on database optimization', suggested: 'Optimized PostgreSQL queries and implemented Redis caching, improving database throughput by 60%', severity: 'high' },
  { id: 3, type: 'format', original: 'Good with React and TypeScript', suggested: 'React (90% proficiency) | TypeScript | Next.js — 3+ years production experience', severity: 'medium' },
  { id: 4, type: 'missing', original: '', suggested: 'Add a "Key Achievements" section highlighting your 312 GitHub stars and 1847 contributions', severity: 'medium' },
  { id: 5, type: 'action', original: 'Helped the team with code reviews', suggested: 'Led weekly code review sessions for a 6-person team, improving code quality metrics by 28%', severity: 'low' },
];

export const getSkillColor = (source) => {
  const colors = {
    resume: '#6366f1',
    github: '#06b6d4',
    leetcode: '#f59e0b',
    manual: '#10b981',
    hackerrank: '#10b981',
    codeforces: '#3b82f6',
  };
  return colors[source] || '#6366f1';
};

export const getMatchColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 65) return '#6366f1';
  if (score >= 50) return '#f59e0b';
  return '#f43f5e';
};
