export type Language = 'uz' | 'uz_cyrl' | 'ru' | 'en';

export type UserRole = 'student' | 'admin' | 'superadmin';

export type AdminDepartment =
  | 'materials'
  | 'tests'
  | 'ai'
  | 'jobs'
  | 'housing'
  | 'payments'
  | 'support'
  | 'all';

export interface User {
  id: string; // 8-digit unique code e.g. "84920153"
  name: string;
  email: string;
  role: UserRole;
  adminDepartment?: AdminDepartment;
  balance: number; // in UZS
  university: string;
  faculty: string;
  course: number;
  phone: string;
  telegram: string;
  avatar?: string;
  isBlocked: boolean;
  createdAt: string;
  activeDevicesCount: number;
}

export interface Transaction {
  id: string;
  orderNumber: string;
  userId: string;
  userName?: string;
  type: 'deposit' | 'expense';
  serviceName: string;
  amount: number;
  currency?: string;
  status: 'completed' | 'pending' | 'rejected';
  paymentMethod: 'telegram' | 'payme' | 'click' | 'admin_bonus' | 'internal_balance';
  telegramReceiptUrl?: string;
  telegramUsername?: string;
  date: string;
  notes?: string;
}

export type MaterialType = 'book' | 'pdf' | 'notes' | 'presentation' | 'video';

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  type: MaterialType;
  university: string;
  faculty: string;
  course: number;
  rating: number;
  ratingsCount?: number;
  downloadsCount?: number;
  downloads?: number;
  viewsCount?: number;
  views?: number;
  size: string;
  author: string;
  description: string;
  fileSnippet?: string;
  isSaved?: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizTest {
  id: string;
  title: string;
  subject: string;
  topic: string;
  timeLimitMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  averageScore: number;
  attemptsCount: number;
  participantsCount: number;
}

export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  subject: string;
  userId: string;
  userName: string;
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  date: string;
  answers: Record<string, number>;
}

export interface QuizResult {
  id: string;
  testId: string;
  testTitle: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}

export interface StudentTask {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'homework' | 'exam' | 'reminder' | 'project';
}

export interface ScheduleItem {
  id: string;
  day: 'Dushanba' | 'Seshanba' | 'Chorshanba' | 'Payshanba' | 'Juma' | 'Shanba';
  time: string;
  subject: string;
  room: string;
  teacher: string;
  type: 'lecture' | 'seminar' | 'lab';
}

export interface AIServiceConfig {
  id:
    | 'presentation'
    | 'conspect'
    | 'referat'
    | 'essay'
    | 'quiz'
    | 'explain'
    | 'summarize'
    | 'grammar'
    | 'translate'
    | 'document'
    | 'illustration_prompt';
  name: string;
  name_uz_cyrl: string;
  name_ru: string;
  name_en: string;
  icon: string;
  description: string;
  description_uz_cyrl: string;
  description_ru: string;
  description_en: string;
  price: number; // in UZS
  maxTimeMinutes: number;
  enabled: boolean;
  badge?: string;
}

export interface AIOrder {
  id: string;
  orderNumber?: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  topic: string;
  instructions?: string;
  targetLanguage?: string;
  options?: Record<string, any>;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  createdAt: string;
  completedAt?: string;
}

export type JobType = 'part_time' | 'internship' | 'remote' | 'freelance' | 'junior';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  city: string;
  type: any;
  salary: string;
  workingHours?: string;
  description: string;
  requirements: string[];
  isRemote?: boolean;
  contactEmail?: string;
  contactTelegram: string;
  contactPhone?: string;
  isSaved?: boolean;
  postedBy?: string;
  createdAt: string;
}

export type HousingType = 'apartment' | 'room' | 'hostel' | 'student_dorm' | 'dormitory';

export interface HousingListing {
  id: string;
  title: string;
  type: any;
  city?: string;
  district: string;
  address: string;
  price: number; // in UZS
  currency?: string;
  deposit?: number;
  rooms?: number;
  distanceToUni?: string;
  distanceToUniversity?: string;
  distanceToMetro: string;
  genderPreference: 'any' | 'girls' | 'boys';
  images: string[];
  features?: string[];
  amenities?: string[];
  contactPhone: string;
  contactTelegram: string;
  description?: string;
  ownerName?: string;
  isSaved?: boolean;
  createdAt: string;
}

export interface RoommatePost {
  id: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  university: string;
  faculty: string;
  course?: number;
  district: string;
  budget: number;
  gender: any;
  neededCount?: number;
  lookingForCount?: number;
  currentCount?: number;
  habits?: string[];
  description: string;
  contactTelegram: string;
  contactPhone: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'test' | 'job' | 'housing' | 'deadline' | 'system';
  read: boolean;
  date: string;
  actionTab?: string;
}

export interface PlatformStats {
  totalUsers: number;
  todayActiveUsers: number;
  totalRevenue: number;
  aiOrdersCount: number;
  materialsCount: number;
  testsTakenCount: number;
}

export interface SystemSettings {
  telegramPaymentAddress: string; // e.g. "@studyhub_billing"
  telegramAdminPhone: string;
  bannerText: string;
  bannerActive: boolean;
  siteMaintenance: boolean;
  announcementText?: string;
}
