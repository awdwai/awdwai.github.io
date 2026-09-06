export const site = {
  name: 'Shrest Bijakal',
  tagline: 'Builder · researcher · engineer — assembling the next signal.',
  location: 'Sugar Land, TX',
  email: 'shrestbijakal@gmail.com',
  phone: null,

  education: {
    school: 'Lawrence E. Elkins High School',
    city: 'Missouri City, TX',
    graduation: 'May 2028',
    gpa: '4.40 / 5.00',
    coursework: [
      'OnRamps Algebra II',
      'AP Computer Science Principles',
      'Principles of Applied Engineering',
      'Engineering Science',
      'AP Physics I',
      'AP Physics II',
    ],
  },

  skills: {
    languages: ['Python', 'Java', 'JavaScript', 'HTML', 'SQL'],
    systems: ['Windows'],
    tools: ['Cursor', 'Git', 'GitHub', 'IntelliJ', 'VS Code', 'Fusion 360'],
    generativeAi: ['ChatGPT', 'Claude', 'Gemini'],
    certifications: [
      'Harvard CS50',
      'Certified Entry-Level Python Programmer',
      'Autodesk Certified User — Fusion 360',
    ],
  },

  projects: [
    {
      id: 'raceday',
      name: 'Raceday Mass Optimizer',
      type: 'Standalone Application',
      dates: 'July 2025 – Sep 2025',
      stack: ['Python', 'Machine Learning', 'Cursor'],
      bullets: [
        'Optimization app for rocket mass distribution under launch parameters',
        'ML-generated optimizer values tuned for a specific rocket profile',
        'Raceday engine for launch-day calibration workflows',
      ],
      links: { github: null, live: null },
    },
    {
      id: 'splitter',
      name: 'Image Splitter',
      type: 'Standalone Application',
      dates: 'Sep 2025 – Present',
      stack: ['Python', 'Open APIs', 'Backend / Frontend'],
      bullets: [
        'Splits images for animation workflows with a clear, human-first UX',
        'Separate backend and frontend for easy forkability',
        'Open-source APIs power the splitting pipeline',
      ],
      links: { github: null, live: null },
    },
    {
      id: 'modpack',
      name: 'Modpack Compat Analyzer',
      type: 'Standalone Application',
      dates: 'Sep 2025 – Present',
      stack: ['Python', 'Backend / Frontend'],
      bullets: [
        'Analyzes Minecraft modpack folders to surface compatibility errors',
        'Split architecture for easy forks; lower resource use than common alternatives',
        'Designed around readable diagnostics, not opaque dumps',
      ],
      links: { github: null, live: null },
    },
    {
      id: 'books',
      name: 'Local Books',
      type: 'Web Application',
      dates: 'Jun 2025 – Aug 2025',
      stack: ['JavaScript'],
      bullets: [
        'Free, locally hosted Zoho Books-style accounting for new businesses',
        'Keeps financial tooling offline and accessible without a SaaS bill',
      ],
      links: { github: null, live: null },
    },
  ],

  experience: [
    {
      id: 'mitra',
      org: 'Mitra Lab, University of Texas at Austin',
      role: 'Research Intern',
      dates: 'June 2025 – July 2025',
      featured: 'Finding Rogue Black Holes Using Machine Learning',
      bullets: [
        'Computational astrophysics under Dr. Shyamal Mitra (High School Research Academy)',
        'Symposium poster: Finding Rogue Black Holes Using Machine Learning',
        "Studied rogue black holes' effects on nearby bodies with Python + Random Forest ML",
      ],
    },
    {
      id: 'robotics',
      org: 'Robotics Club, Lawrence E. Elkins High School',
      role: 'Driver, Designer, Builder, Coder',
      dates: 'Nov 2024 – Present',
      featured: null,
      bullets: [
        'Team of 10 designing and building competition robots',
        'Frame and structure design focused on inputs and outputs',
        'Built I/O systems and reinforced structural integrity',
        'Coded autonomous mode for unattended task completion',
      ],
    },
  ],

  leadership: {
    org: 'Bridging Communities through Engineering (BCE)',
    school: 'Lawrence E. Elkins High School',
    role: 'Founder, President',
    dates: 'April 2026 – Present',
    bullets: [
      'Founded an engineering-based community service club',
      'Leads 10 active members: meetings, planning, and institutional outreach',
      'Sugar Land Engineering Dept. project: cleaning pipe datasheets in Excel, spotting inconsistencies, and researching industrial pipe cost valuation',
    ],
  },

  packages: [
    { id: 'education', label: 'Education' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'contact', label: 'Contact' },
  ],

  nav: [
    { label: 'Education', id: 'education' },
    { label: 'Projects', id: 'projects' },
    { label: 'Experience', id: 'experience' },
    { label: 'Skills', id: 'skills' },
    { label: 'Leadership', id: 'leadership' },
    { label: 'Contact', id: 'contact' },
  ],

  /**
   * Site-built procedural arm (no third-party GLB).
   * Sketchfab CC-BY and Poly Pizza downloads required auth / lacked usable joints.
   */
  modelCredit: {
    title: '6-axis industrial arm',
    author: 'built for this site',
    license: 'Original (site-built procedural model)',
    url: null,
    note: 'Iron / jet-black body with orange accents — no third-party 3D asset.',
  },
}
