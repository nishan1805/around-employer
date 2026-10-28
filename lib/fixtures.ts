import { DAILY_SUMMARY_DEFAULT_TIME, EXPIRY_REMINDER_DEFAULT } from "@/src/config/policy";
import type {
  AccountSettings,
  Applicant,
  AppNotification,
  CompanyProfile,
  Job,
  JobStatus,
  TeamMember,
} from "@/lib/types";

const DESC =
  "We are looking for a Store Sales Associate to join our retail team in Raipur. The ideal candidate will be responsible for assisting customers, maintaining store displays, and ensuring a great shopping experience. You'll play a key role in driving sales and building strong customer relationships.";

export const EMPLOYER = {
  companyName: "Raipur Builder",
  email: "hiring@raipurbuilder.in",
  ownerName: "Rakesh Agrawal",
  avatarInitials: "RB",
  location: "Shankar Nagar, Raipur",
};

export const LOCATIONS = [
  "Shankar Nagar, Raipur",
  "Pandri, Raipur",
  "Telibandha, Raipur",
  "Bhilai",
  "Durg",
];

export const COMPANY: CompanyProfile = {
  name: "Shree Ganesh Retail Mart",
  industry: "Retail & Grocery",
  description:
    "Family-run grocery and household store in Pandri since 2009. Three branches across Raipur and Bhilai, offering daily essentials, fresh produce and warm service to local families.",
  workplaceLocation: "Pandri, Raipur",
  workingHours: "9:00 AM – 9:00 PM",
  website: "https://www.shreeganeshmart.in",
  linkedin: "https://www.linkedin.com/company/shreeganeshshmart",
  instagram: "https://www.instagram.com/shreeganeshshmart",
  logoInitials: "SG",
  logoDataUrl: null,
};

export const SETTINGS: AccountSettings = {
  name: "Rakesh Agrawal",
  role: "Owner",
  email: "hiring@raipurbuilder.in",
  phone: "+91 98XXX XXXXX",
  emailVerified: true,
  phoneVerified: true,
  companyName: "Raipur Builder",
  prefs: {
    newApplicant: { email: true, inApp: true },
    dailySummary: { email: true, sendAt: DAILY_SUMMARY_DEFAULT_TIME },
    whatsapp: { enabled: false, phone: "", verified: false },
    expiryReminders: { email: true, inApp: true, remindMe: EXPIRY_REMINDER_DEFAULT },
    productUpdates: { email: false, inApp: false },
    billing: { email: true, inApp: false },
  },
};

export const TEAM: TeamMember[] = [
  {
    id: "tm-owner",
    name: "Rakesh Agrawal",
    email: "hiring@raipurbuilder.in",
    role: "Owner",
    status: "Active",
    initials: "RA",
    you: true,
  },
  {
    id: "tm-priya",
    name: "Priya Verma",
    email: "priya.verma@raipurbuilder.in",
    role: "Hiring manager",
    status: "Active",
    initials: "PV",
  },
  {
    id: "tm-arjun",
    name: "Arjun Sahu",
    email: "arjun.sahu@raipurbuilder.in",
    role: "Recruiter",
    status: "Active",
    initials: "AS",
  },
  {
    id: "tm-neha",
    name: "Neha Tiwari",
    email: "neha.tiwari@raipurbuilder.in",
    role: "Hiring manager",
    status: "Pending",
    initials: "NT",
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    title: "New applicant",
    body: "Priya Verma applied for Architect",
    time: "5 min ago",
    unread: true,
    tone: "applicant",
  },
  {
    id: "n2",
    title: "Job approved",
    body: "Site Supervisor is now live on Around Jobs",
    time: "1 hr ago",
    unread: false,
    tone: "approved",
  },
  {
    id: "n3",
    title: "Job returned for correction",
    body: "Civil Engineer needs changes before it can go live",
    time: "3 hrs ago",
    unread: false,
    tone: "returned",
  },
  {
    id: "n4",
    title: "Job expiring soon",
    body: "Civil Engineer expires in 2 days",
    time: "5 hrs ago",
    unread: false,
    tone: "expiring",
  },
  {
    id: "n5",
    title: "New applicant",
    body: "Amit Patel applied for Civil Engineer",
    time: "2 days ago",
    unread: false,
    tone: "applicant",
  },
];

const SKILLS = ["Communication", "Sales", "Customer Service", "MS Office"];

function job(partial: Omit<Job, "description" | "skills" | "benefits" | "education" | "workArrangement" | "openings" | "experience" | "salaryType" | "monthlySalary"> & Partial<Job>): Job {
  return {
    description: DESC,
    skills: SKILLS,
    benefits: ["PF", "ESI"],
    education: "Any graduation",
    workArrangement: "On-site",
    openings: 1,
    experience: "1–3 years",
    salaryType: "Fixed salary",
    monthlySalary: 25000,
    ...partial,
  };
}

const featured: Job[] = [
  job({
    id: "store-sales-associate",
    code: "AR-001",
    title: "Store Sales Associate",
    location: "Pandri, Raipur",
    category: "Retail",
    employmentType: "Full-time",
    status: "active",
    views: 412,
    applicants: 18,
    postedOn: "2026-10-12",
    expiresOn: "2026-11-11",
  }),
  job({
    id: "front-desk",
    code: "AR-002",
    title: "Front Desk Executive – Hotel",
    location: "Raipur",
    category: "Hospitality",
    employmentType: "Full-time",
    status: "paused",
    views: 230,
    applicants: 9,
    postedOn: "2026-10-09",
  }),
  job({
    id: "patient-care",
    code: "AR-003",
    title: "Patient Care Assistant",
    location: "Raipur",
    category: "Healthcare",
    employmentType: "Full-time",
    status: "active",
    views: 198,
    applicants: 11,
    postedOn: "2026-10-08",
  }),
  job({
    id: "office-admin",
    code: "AR-004",
    title: "Office Admin Assistant",
    location: "Raipur",
    category: "Administration",
    employmentType: "Full-time",
    status: "returned",
    views: 76,
    applicants: 4,
    postedOn: "2026-10-05",
    returnedOn: "2026-10-27",
    listReason: "Salary range has no maximum",
    returnReasons: [
      { field: "Salary range", message: "Range has no maximum. Add an upper limit before resubmitting." },
    ],
  }),
  job({
    id: "junior-web",
    code: "AR-005",
    title: "Junior Web Developer",
    location: "Raipur",
    category: "IT & Software",
    employmentType: "Full-time",
    status: "expired",
    views: 506,
    applicants: 23,
    postedOn: "2026-09-18",
    expiresOn: "2026-10-18",
  }),
  job({
    id: "field-sales",
    code: "AR-006",
    title: "Field Sales Executive",
    location: "Raipur",
    category: "Sales",
    employmentType: "Full-time",
    status: "active",
    views: 320,
    applicants: 14,
    postedOn: "2026-09-15",
  }),
  job({
    id: "content-writer",
    code: "AR-007",
    title: "Content Writer",
    location: "Bhilai",
    category: "Marketing",
    employmentType: "Part-time",
    status: "draft",
    views: 88,
    applicants: 6,
    postedOn: "2026-09-14",
  }),
  job({
    id: "graphic-designer",
    code: "AR-008",
    title: "Graphic Designer",
    location: "Durg",
    category: "Design",
    employmentType: "Full-time",
    status: "pending_review",
    views: 260,
    applicants: 10,
    postedOn: "2026-09-12",
    submittedOn: "2026-10-27",
  }),
  job({
    id: "product-manager",
    code: "AR-009",
    title: "Product Manager",
    location: "Raipur",
    category: "Product",
    employmentType: "Full-time",
    status: "active",
    views: 184,
    applicants: 8,
    postedOn: "2026-09-10",
  }),
  job({
    id: "data-analyst",
    code: "AR-010",
    title: "Data Analyst",
    location: "Bhilai",
    category: "Data & Analytics",
    employmentType: "Full-time",
    status: "paused",
    views: 146,
    applicants: 7,
    postedOn: "2026-09-06",
  }),
];

const extraPlan: { status: JobStatus; count: number }[] = [
  { status: "active", count: 8 },
  { status: "draft", count: 3 },
  { status: "pending_review", count: 5 },
  { status: "returned", count: 2 },
  { status: "paused", count: 3 },
  { status: "expired", count: 13 },
  { status: "closed", count: 4 },
];

const extraTitles = [
  "Delivery Executive",
  "Kitchen Helper",
  "Site Supervisor",
  "Cashier",
  "Civil Engineer",
  "Architect",
  "Sales Associate",
  "Barista Trainee",
  "Warehouse Picker",
  "Accountant",
];

const extraLocations = ["Raipur", "Pandri, Raipur", "Bhilai", "Durg", "Raipur"];
const extraCategories = ["Logistics", "Hospitality", "Construction", "Retail", "Engineering", "Design", "Sales", "Hospitality", "Logistics", "Finance"];

const extras: Job[] = [];
let cursor = 0;
let day = 5;
for (const bucket of extraPlan) {
  for (let i = 0; i < bucket.count; i += 1) {
    const n = cursor;
    const title = n === 0 ? "Delivery Executive" : n === 1 ? "Kitchen Helper" : extraTitles[n % extraTitles.length];
    const iso = new Date(Date.UTC(2026, 8, day)).toISOString().slice(0, 10);
    day = Math.max(1, day - 1);
    if (day === 1) day = 28;
    extras.push(
      job({
        id: `job-x-${n + 1}`,
        code: `AR-${String(11 + n).padStart(3, "0")}`,
        title: n < 2 ? title : `${title} ${n + 1}`,
        location: extraLocations[n % extraLocations.length],
        category: extraCategories[n % extraCategories.length],
        employmentType: n % 5 === 0 ? "Part-time" : "Full-time",
        status: bucket.status,
        views: 40 + ((n * 17) % 400),
        applicants: n % 12,
        postedOn: iso,
        listReason:
          title === "Delivery Executive"
            ? "Job description too short"
            : title === "Kitchen Helper"
              ? "Wrong job category"
              : undefined,
        returnReasons:
          bucket.status === "returned"
            ? [{ field: "Job description", message: title === "Kitchen Helper" ? "Wrong job category." : "Job description is too short." }]
            : undefined,
        returnedOn: bucket.status === "returned" ? "2026-10-20" : undefined,
      }),
    );
    cursor += 1;
  }
}

const returnedExtras = extras.filter((item) => item.status === "returned");
if (returnedExtras[0]) {
  returnedExtras[0].title = "Delivery Executive";
  returnedExtras[0].category = "Logistics";
  returnedExtras[0].listReason = "Job description too short";
  returnedExtras[0].returnReasons = [
    { field: "Job description", message: "Job description is too short." },
  ];
}
if (returnedExtras[1]) {
  returnedExtras[1].title = "Kitchen Helper";
  returnedExtras[1].category = "Hospitality";
  returnedExtras[1].employmentType = "Part-time";
  returnedExtras[1].location = "Bhilai";
  returnedExtras[1].listReason = "Wrong job category";
  returnedExtras[1].returnReasons = [
    { field: "Job category", message: "Wrong job category." },
  ];
}

export const JOBS: Job[] = [...featured, ...extras];

export const DASHBOARD_ACTIVE: Pick<Job, "id" | "title" | "employmentType" | "location" | "views" | "applicants" | "status">[] = [
  { id: "civil", title: "Civil Engineer", employmentType: "Full-time", location: "Raipur", views: 412, applicants: 18, status: "active" },
  { id: "architect", title: "Architect", employmentType: "Full-time", location: "Raipur", views: 198, applicants: 11, status: "active" },
];

const amitDetail: Applicant["detail"] = {
  about:
    "Passionate UI/UX designer with a strong interest in building user-friendly digital products. Experienced in designing responsive web and mobile interfaces, creating design systems and collaborating with development teams. Eager to contribute to meaningful products and grow as a designer.",
  skills: ["UI Design", "UX Research", "Figma", "User Flows", "Wireframing", "Prototyping", "HTML", "CSS", "JavaScript", "React", "Tailwind CSS"],
  experienceItems: [
    {
      title: "UI/UX Designer",
      org: "Nable Invent Solutions · Internship",
      dates: "Apr 2023 – Aug 2023 (5 months)",
      description: "Designed responsive marketing pages and a component library used by the product squad.",
    },
    {
      title: "Frontend Developer",
      org: "CredoHire · Internship",
      dates: "Aug 2023 – Sep 2023 (2 months)",
      description: "Built interface prototypes in React and paired with design on the hiring dashboard.",
    },
  ],
  education: {
    degree: "Bachelor of Computer Applications (BCA)",
    school: "Pt. Ravishankar Shukla University, Raipur",
    dates: "2020 – 2023",
  },
  employmentPreference: "Full-time",
  noticePeriod: "30 days",
  source: "Direct Apply",
  links: [
    { label: "behance.net/amitsharma", href: "https://behance.net/amitsharma" },
    { label: "dribbble.com/amitsharma", href: "https://dribbble.com/amitsharma" },
  ],
  resume: {
    fileName: "Amit_Sharma_Resume.pdf",
    pages: [
      {
        heading: "Amit Sharma",
        body: "UI/UX Designer · Raipur\n+91 98765 43210 · amit.sharma@email.com\n\nSummary\nDesigner focused on clear hiring and retail interfaces. Comfortable taking a flow from research notes to a shipped React screen.",
      },
      {
        heading: "Experience",
        body: "UI/UX Designer — Nable Invent Solutions (Apr 2023 – Aug 2023)\nShipped the marketing site and a 40-component library.\n\nFrontend Developer — CredoHire (Aug 2023 – Sep 2023)\nPrototyped the candidate pipeline in React.",
      },
      {
        heading: "Education & skills",
        body: "BCA, Pt. Ravishankar Shukla University, 2020 – 2023\n\nFigma, user flows, wireframing, prototyping, HTML, CSS, JavaScript, React, Tailwind CSS.",
      },
    ],
  },
};

function applicant(partial: Applicant): Applicant {
  return partial;
}

const named: Applicant[] = [
  applicant({
    id: "amit-sharma",
    name: "Amit Sharma",
    initials: "AS",
    jobId: "graphic-designer",
    jobTitle: "UI/UX Designer",
    status: "New",
    appliedOn: "2026-10-14",
    experience: "2–3 years",
    location: "Raipur, Chhattisgarh",
    phone: "+91 98765 43210",
    email: "amit.sharma@email.com",
    avatarTone: "blue",
    highlightNew: true,
    notes: [{ id: "note-1", author: "You", at: "2026-10-27", text: "Strong portfolio. Ask about retail dashboards." }],
    detail: amitDetail,
  }),
  applicant({
    id: "priya-verma",
    name: "Priya Verma",
    initials: "PV",
    jobId: "architect-role",
    jobTitle: "Architect",
    status: "New",
    appliedOn: "2026-10-27",
    experience: "3 yrs",
    location: "Raipur",
    phone: "+91 9811111111",
    email: "priya.verma@email.com",
    avatarTone: "blue",
    highlightNew: true,
    notes: [],
  }),
  applicant({
    id: "amit-patel",
    name: "Amit Patel",
    initials: "AP",
    jobId: "civil",
    jobTitle: "Civil Engineer",
    status: "Interviewing",
    appliedOn: "2026-10-25",
    experience: "4 yrs",
    location: "Raipur",
    phone: "+91 9822222222",
    email: "amit.patel@email.com",
    avatarTone: "orange",
    highlightNew: true,
    notes: [],
  }),
  applicant({
    id: "rahul-sharma",
    name: "Rahul Sharma",
    initials: "RS",
    jobId: "civil",
    jobTitle: "Civil Engineer",
    status: "Shortlisted",
    appliedOn: "2026-10-21",
    experience: "2 yrs",
    location: "Raipur",
    phone: "+91 9833333333",
    email: "rahul.sharma@email.com",
    avatarTone: "green",
    notes: [],
  }),
  applicant({
    id: "aarti-sahu",
    name: "Aarti Sahu",
    initials: "AS",
    jobId: "store-sales-associate",
    jobTitle: "Store Sales Associate",
    status: "New",
    appliedOn: "2026-10-26",
    experience: "2 yrs retail",
    location: "Pandri",
    phone: "+91 9844444444",
    email: "aarti.sahu@email.com",
    avatarTone: "blue",
    notes: [{ id: "note-a", author: "You", at: "2026-10-27", text: "Speaks Hindi & Chhattisgarhi, ok with weekend shifts." }],
  }),
  applicant({
    id: "rohit-verma",
    name: "Rohit Verma",
    initials: "RV",
    jobId: "store-sales-associate",
    jobTitle: "Store Sales Associate",
    status: "Shortlisted",
    appliedOn: "2026-10-20",
    experience: "Fresher",
    location: "Telibandha",
    phone: "+91 9855555555",
    email: "rohit.verma@email.com",
    avatarTone: "orange",
    notes: [],
  }),
  applicant({
    id: "neha-patel",
    name: "Neha Patel",
    initials: "NP",
    jobId: "store-sales-associate",
    jobTitle: "Store Sales Associate",
    status: "Interviewing",
    appliedOn: "2026-10-18",
    experience: "3 yrs sales",
    location: "Shankar Nagar",
    phone: "+91 9866666666",
    email: "neha.patel@email.com",
    avatarTone: "purple",
    notes: [],
  }),
  applicant({
    id: "imran-khan",
    name: "Imran Khan",
    initials: "IK",
    jobId: "store-sales-associate",
    jobTitle: "Store Sales Associate",
    status: "Hired",
    appliedOn: "2026-10-12",
    experience: "1 yr retail",
    location: "Tatibandh",
    phone: "+91 9877777777",
    email: "imran.khan@email.com",
    avatarTone: "green",
    notes: [],
  }),
  applicant({
    id: "pooja-yadav",
    name: "Pooja Yadav",
    initials: "PY",
    jobId: "store-sales-associate",
    jobTitle: "Store Sales Associate",
    status: "Rejected",
    appliedOn: "2026-10-10",
    experience: "Fresher",
    location: "Mowa",
    phone: "+91 9888888888",
    email: "pooja.yadav@email.com",
    avatarTone: "pink",
    notes: [],
  }),
];

const statusFill: Applicant["status"][] = [
  ...Array.from({ length: 9 }, () => "New" as const),
  ...Array.from({ length: 8 }, () => "Shortlisted" as const),
  ...Array.from({ length: 6 }, () => "Interviewing" as const),
  ...Array.from({ length: 3 }, () => "Hired" as const),
  ...Array.from({ length: 13 }, () => "Rejected" as const),
];

const firstNames = ["Anjali", "Vikram", "Sana", "Karan", "Meera", "Arjun", "Divya", "Harsh", "Nisha", "Ravi"];
const lastNames = ["Sahu", "Verma", "Patel", "Khan", "Yadav", "Dewangan", "Joshi", "Naidu"];

const filled: Applicant[] = statusFill.map((status, i) => {
  const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]} ${i + 1}`;
  return {
    id: `app-${i + 1}`,
    name,
    initials: `${name[0]}${lastNames[i % lastNames.length][0]}`,
    jobId: JOBS[i % JOBS.length].id,
    jobTitle: JOBS[i % JOBS.length].title,
    status,
    appliedOn: `2026-09-${String((i % 27) + 1).padStart(2, "0")}`,
    experience: i % 3 === 0 ? "Fresher" : `${(i % 5) + 1} yrs`,
    location: ["Raipur", "Bhilai", "Durg", "Pandri"][i % 4],
    phone: `+91 90000${String(10000 + i).slice(-5)}`,
    email: `candidate${i + 1}@email.com`,
    avatarTone: (["blue", "orange", "green", "purple", "pink"] as const)[i % 5],
    notes: [],
  };
});

export const APPLICANTS: Applicant[] = [...named, ...filled];

export const INDUSTRIES = [
  "Retail & Grocery",
  "Construction",
  "Hospitality",
  "Healthcare",
  "IT & Software",
  "Education",
  "Manufacturing",
  "Other",
];

export const CATEGORIES = [
  "Retail",
  "Hospitality",
  "Healthcare",
  "Administration",
  "IT & Software",
  "Sales",
  "Marketing",
  "Design",
  "Product",
  "Data & Analytics",
  "Logistics",
  "Construction",
  "Engineering",
  "Finance",
];

export const BENEFITS = [
  "PF",
  "ESI",
  "Health insurance",
  "Performance bonus",
  "Incentives",
  "Flexible timing",
  "Work from home allowance",
  "Other",
];

export const DOCUMENT_OPTIONS = [
  { id: "gst", label: "GST certificate" },
  { id: "pan", label: "Company PAN card" },
  { id: "cin", label: "CIN / government registration certificate" },
  { id: "shop", label: "Shop & Establishment licence" },
  { id: "fssai", label: "FSSAI licence (food businesses)" },
  { id: "other", label: "Other government business document (manual review)" },
] as const;
