// ============= TYPES =============
export interface Drive {
  id: string;
  company: string;
  logo: string;
  role: string;
  salaryMin: number;
  salaryMax: number;
  experience: string;
  location: string;
  deadline: string;
  openings: number;
  bond: string;
  description: string;
  requirements: string[];
  rounds: DriveRound[];
  status: "open" | "closed" | "upcoming";
}

export interface DriveRound {
  number: number;
  label: string;
  type: "exam" | "technical" | "hr" | "group-discussion";
}

export interface Application {
  id: string;
  driveId: string;
  company: string;
  role: string;
  appliedDate: string;
  status: "applied" | "shortlisted" | "in-progress" | "selected" | "rejected";
  currentRound: number;
  rounds: ApplicationRound[];
}

export interface ApplicationRound {
  number: number;
  label: string;
  type: string;
  status: "completed" | "current" | "locked";
  score?: number;
  maxScore?: number;
  result?: "pass" | "fail";
  feedback?: string;
}

export interface ExamQuestion {
  id: number;
  text: string;
  options: string[];
  correct: number;
  module: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
}

export interface Interview {
  id: string;
  applicationId: string;
  company: string;
  role: string;
  roundName: string;
  interviewer: string;
  date: string;
  time: string;
  status: "scheduled" | "completed";
  score?: number;
  bonus?: number;
  result?: "pass" | "fail";
  comments?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
}

export interface JobDescription {
  id: string;
  companyId: string;
  role: string;
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
  bond: string;
  location: string;
  status: "draft" | "active" | "closed";
}

export interface AdminQuestion {
  id: string;
  module: string;
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "coding" | "subjective";
  marks: number;
  text: string;
  options: string[];
  correct: number;
}

// ============= MOCK DATA =============

export const DRIVES: Drive[] = [
  {
    id: "d1", company: "Infosys", logo: "I", role: "Software Engineer", salaryMin: 350000, salaryMax: 500000,
    experience: "0-1 years", location: "Bangalore", deadline: "2026-03-15", openings: 50, bond: "2 Years",
    description: "Join Infosys as a Software Engineer and work on cutting-edge technologies across global projects.",
    requirements: ["B.Tech/B.E. in CS/IT", "Min 60% aggregate", "No active backlogs", "Good communication skills"],
    rounds: [
      { number: 1, label: "Aptitude Test", type: "exam" },
      { number: 2, label: "Technical Interview", type: "technical" },
      { number: 3, label: "HR Interview", type: "hr" },
    ],
    status: "open",
  },
  {
    id: "d2", company: "TCS", logo: "T", role: "Systems Engineer", salaryMin: 300000, salaryMax: 450000,
    experience: "0 years", location: "Mumbai", deadline: "2026-03-20", openings: 120, bond: "1 Year",
    description: "TCS hiring freshers for their flagship Systems Engineer role across India.",
    requirements: ["Any degree", "Min 50% aggregate", "No backlogs"],
    rounds: [
      { number: 1, label: "Online Assessment", type: "exam" },
      { number: 2, label: "Technical Interview", type: "technical" },
      { number: 3, label: "Managerial Round", type: "technical" },
      { number: 4, label: "HR Round", type: "hr" },
    ],
    status: "open",
  },
  {
    id: "d3", company: "Wipro", logo: "W", role: "Project Engineer", salaryMin: 380000, salaryMax: 480000,
    experience: "0-1 years", location: "Hyderabad", deadline: "2026-04-01", openings: 80, bond: "None",
    description: "Wipro is looking for passionate engineers to join their technology division.",
    requirements: ["B.Tech in CS/IT/ECE", "Min 65% aggregate", "Strong coding skills"],
    rounds: [
      { number: 1, label: "Coding Test", type: "exam" },
      { number: 2, label: "Group Discussion", type: "group-discussion" },
      { number: 3, label: "Technical Interview", type: "technical" },
    ],
    status: "open",
  },
  {
    id: "d4", company: "Cognizant", logo: "C", role: "Programmer Analyst", salaryMin: 400000, salaryMax: 550000,
    experience: "0 years", location: "Chennai", deadline: "2026-03-25", openings: 60, bond: "2 Years",
    description: "Cognizant GenC program for fresh graduates with competitive salary and rapid growth.",
    requirements: ["B.Tech/MCA", "Min 60% throughout", "Willingness to relocate"],
    rounds: [
      { number: 1, label: "Aptitude + Coding", type: "exam" },
      { number: 2, label: "Communication Assessment", type: "hr" },
    ],
    status: "open",
  },
  {
    id: "d5", company: "Accenture", logo: "A", role: "Associate Software Engineer", salaryMin: 450000, salaryMax: 600000,
    experience: "0 years", location: "Pune", deadline: "2026-04-10", openings: 100, bond: "None",
    description: "Accenture's campus hiring for technology roles across multiple service lines.",
    requirements: ["Any engineering degree", "Min 55% aggregate"],
    rounds: [
      { number: 1, label: "Cognitive Assessment", type: "exam" },
      { number: 2, label: "Technical Assessment", type: "exam" },
      { number: 3, label: "Communication Test", type: "hr" },
    ],
    status: "upcoming",
  },
  {
    id: "d6", company: "HCL Technologies", logo: "H", role: "Graduate Engineer Trainee", salaryMin: 320000, salaryMax: 420000,
    experience: "0 years", location: "Noida", deadline: "2026-02-28", openings: 40, bond: "1 Year",
    description: "HCL's GET program offering training and real project exposure from day one.",
    requirements: ["B.Tech/B.E.", "Min 60%", "Good aptitude"],
    rounds: [
      { number: 1, label: "Online Test", type: "exam" },
      { number: 2, label: "Technical + HR", type: "technical" },
    ],
    status: "closed",
  },
];

export const APPLICATIONS: Application[] = [
  {
    id: "a1", driveId: "d1", company: "Infosys", role: "Software Engineer", appliedDate: "2026-02-20",
    status: "in-progress", currentRound: 2,
    rounds: [
      { number: 1, label: "Applied", type: "apply", status: "completed", result: "pass" },
      { number: 2, label: "Shortlisted", type: "shortlist", status: "completed", result: "pass" },
      { number: 3, label: "Aptitude Test", type: "exam", status: "completed", score: 78, maxScore: 100, result: "pass", feedback: "Good analytical skills" },
      { number: 4, label: "Technical Interview", type: "technical", status: "current" },
      { number: 5, label: "HR Interview", type: "hr", status: "locked" },
    ],
  },
  {
    id: "a2", driveId: "d2", company: "TCS", role: "Systems Engineer", appliedDate: "2026-02-22",
    status: "shortlisted", currentRound: 1,
    rounds: [
      { number: 1, label: "Applied", type: "apply", status: "completed", result: "pass" },
      { number: 2, label: "Shortlisted", type: "shortlist", status: "completed", result: "pass" },
      { number: 3, label: "Online Assessment", type: "exam", status: "current" },
      { number: 4, label: "Technical Interview", type: "technical", status: "locked" },
      { number: 5, label: "Managerial Round", type: "technical", status: "locked" },
      { number: 6, label: "HR Round", type: "hr", status: "locked" },
    ],
  },
  {
    id: "a3", driveId: "d3", company: "Wipro", role: "Project Engineer", appliedDate: "2026-02-18",
    status: "selected", currentRound: 3,
    rounds: [
      { number: 1, label: "Applied", type: "apply", status: "completed", result: "pass" },
      { number: 2, label: "Shortlisted", type: "shortlist", status: "completed", result: "pass" },
      { number: 3, label: "Coding Test", type: "exam", status: "completed", score: 85, maxScore: 100, result: "pass", feedback: "Excellent coding skills" },
      { number: 4, label: "Group Discussion", type: "gd", status: "completed", score: 8, maxScore: 10, result: "pass" },
      { number: 5, label: "Technical Interview", type: "technical", status: "completed", score: 42, maxScore: 50, result: "pass", feedback: "Strong fundamentals" },
    ],
  },
];

export const EXAM_QUESTIONS: ExamQuestion[] = [
  { id: 1, text: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correct: 1, module: "DSA", difficulty: "easy", marks: 2 },
  { id: 2, text: "Which data structure uses LIFO principle?", options: ["Queue", "Stack", "Array", "Linked List"], correct: 1, module: "DSA", difficulty: "easy", marks: 2 },
  { id: 3, text: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"], correct: 0, module: "DBMS", difficulty: "easy", marks: 2 },
  { id: 4, text: "Which sorting algorithm has the best average-case time complexity?", options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"], correct: 2, module: "DSA", difficulty: "medium", marks: 3 },
  { id: 5, text: "What is the output of 3 + 2 + '7' in JavaScript?", options: ["12", "'57'", "'327'", "57"], correct: 1, module: "Programming", difficulty: "medium", marks: 3 },
  { id: 6, text: "Which protocol is used for secure communication over the internet?", options: ["HTTP", "FTP", "HTTPS", "SMTP"], correct: 2, module: "Networking", difficulty: "easy", marks: 2 },
  { id: 7, text: "What is a foreign key in database terminology?", options: ["A primary key in another table", "A key that references a primary key in another table", "An encrypted key", "A unique identifier"], correct: 1, module: "DBMS", difficulty: "medium", marks: 3 },
  { id: 8, text: "Which of the following is not an OOP principle?", options: ["Encapsulation", "Compilation", "Inheritance", "Polymorphism"], correct: 1, module: "OOP", difficulty: "easy", marks: 2 },
  { id: 9, text: "What is the worst-case time complexity of quicksort?", options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], correct: 1, module: "DSA", difficulty: "hard", marks: 5 },
  { id: 10, text: "In TCP/IP, which layer is responsible for routing?", options: ["Application", "Transport", "Network", "Data Link"], correct: 2, module: "Networking", difficulty: "medium", marks: 3 },
  { id: 11, text: "What is the purpose of normalization in databases?", options: ["Increase redundancy", "Reduce redundancy", "Add more tables", "Speed up queries"], correct: 1, module: "DBMS", difficulty: "medium", marks: 3 },
  { id: 12, text: "Which design pattern ensures only one instance of a class exists?", options: ["Factory", "Observer", "Singleton", "Strategy"], correct: 2, module: "OOP", difficulty: "medium", marks: 3 },
  { id: 13, text: "What is the space complexity of merge sort?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: 1, module: "DSA", difficulty: "hard", marks: 5 },
  { id: 14, text: "Which HTTP method is idempotent?", options: ["POST", "PUT", "PATCH", "None"], correct: 1, module: "Networking", difficulty: "hard", marks: 5 },
  { id: 15, text: "What does ACID stand for in database transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Addition, Consistency, Isolation, Dependency", "Atomicity, Concurrency, Isolation, Durability", "Atomicity, Consistency, Integration, Durability"], correct: 0, module: "DBMS", difficulty: "medium", marks: 3 },
  { id: 16, text: "Which traversal gives sorted output from a BST?", options: ["Preorder", "Postorder", "Inorder", "Level order"], correct: 2, module: "DSA", difficulty: "easy", marks: 2 },
  { id: 17, text: "What is polymorphism?", options: ["Multiple inheritance", "Method overloading/overriding", "Data hiding", "Abstraction"], correct: 1, module: "OOP", difficulty: "easy", marks: 2 },
  { id: 18, text: "What is a deadlock?", options: ["Process termination", "Circular wait for resources", "Memory overflow", "CPU idle state"], correct: 1, module: "OS", difficulty: "medium", marks: 3 },
  { id: 19, text: "Which of the following is a NoSQL database?", options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"], correct: 2, module: "DBMS", difficulty: "easy", marks: 2 },
  { id: 20, text: "What is the primary purpose of an index in a database?", options: ["Store data", "Speed up queries", "Enforce constraints", "Backup data"], correct: 1, module: "DBMS", difficulty: "medium", marks: 3 },
];

export const INTERVIEWS: Interview[] = [
  {
    id: "i1", applicationId: "a1", company: "Infosys", role: "Software Engineer",
    roundName: "Technical Interview", interviewer: "Rajesh Kumar", date: "2026-03-10", time: "10:00 AM",
    status: "scheduled",
  },
  {
    id: "i2", applicationId: "a3", company: "Wipro", role: "Project Engineer",
    roundName: "Technical Interview", interviewer: "Priya Sharma", date: "2026-02-25", time: "2:00 PM",
    status: "completed", score: 42, bonus: 3, result: "pass",
    comments: "Strong problem-solving skills. Good understanding of data structures. Communication could be improved slightly.",
  },
];

export const COMPANIES: Company[] = [
  { id: "c1", name: "Infosys", industry: "IT Services", website: "infosys.com", contactPerson: "Ravi Menon", email: "hr@infosys.com", phone: "080-12345678", status: "active" },
  { id: "c2", name: "TCS", industry: "IT Services", website: "tcs.com", contactPerson: "Anita Desai", email: "campus@tcs.com", phone: "022-98765432", status: "active" },
  { id: "c3", name: "Wipro", industry: "IT Services", website: "wipro.com", contactPerson: "Suresh Nair", email: "recruit@wipro.com", phone: "040-55667788", status: "active" },
  { id: "c4", name: "Cognizant", industry: "IT Consulting", website: "cognizant.com", contactPerson: "Meera Pillai", email: "hr@cognizant.com", phone: "044-11223344", status: "active" },
  { id: "c5", name: "Accenture", industry: "Consulting", website: "accenture.com", contactPerson: "John D'Souza", email: "campus@accenture.com", phone: "020-99887766", status: "inactive" },
  { id: "c6", name: "HCL Technologies", industry: "IT Services", website: "hcltech.com", contactPerson: "Kavita Joshi", email: "hr@hcltech.com", phone: "0120-44556677", status: "active" },
];

export const ADMIN_QUESTIONS: AdminQuestion[] = [
  { id: "q1", module: "DSA", difficulty: "easy", type: "mcq", marks: 2, text: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correct: 1 },
  { id: "q2", module: "DSA", difficulty: "medium", type: "mcq", marks: 3, text: "Which sorting algorithm has O(n log n) average case?", options: ["Bubble", "Selection", "Merge", "Insertion"], correct: 2 },
  { id: "q3", module: "DBMS", difficulty: "easy", type: "mcq", marks: 2, text: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"], correct: 0 },
  { id: "q4", module: "OOP", difficulty: "hard", type: "coding", marks: 10, text: "Implement a Singleton pattern in Java", options: [], correct: -1 },
  { id: "q5", module: "Networking", difficulty: "medium", type: "mcq", marks: 3, text: "Which layer handles routing in OSI model?", options: ["Transport", "Network", "Data Link", "Session"], correct: 1 },
];

// Status color mapping
export const STATUS_COLORS: Record<string, string> = {
  "applied": "bg-primary/10 text-primary",
  "shortlisted": "bg-purple-100 text-purple-700",
  "in-progress": "bg-warning/10 text-warning",
  "selected": "bg-amber-100 text-amber-700",
  "rejected": "bg-destructive/10 text-destructive",
  "pass": "bg-success/10 text-success",
  "fail": "bg-destructive/10 text-destructive",
  "open": "bg-success/10 text-success",
  "closed": "bg-destructive/10 text-destructive",
  "upcoming": "bg-primary/10 text-primary",
  "scheduled": "bg-primary/10 text-primary",
  "completed": "bg-success/10 text-success",
  "active": "bg-success/10 text-success",
  "inactive": "bg-muted text-muted-foreground",
  "draft": "bg-warning/10 text-warning",
};

export function formatSalary(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
}
