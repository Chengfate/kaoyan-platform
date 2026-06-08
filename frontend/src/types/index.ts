export interface School {
  id: number;
  name: string;
  short_name: string | null;
  code: string;
  province: string;
  city: string | null;
  tier: '985' | '211' | '双一流' | '普通一本' | '二本' | '其他';
  category: string;
  is_self_rated: number;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  major_count: number;
  created_at: string;
  updated_at: string;
}

export interface Major {
  id: number;
  code: string;
  name: string;
  discipline: string;
  category: string;
  degree_type: string;
  description: string | null;
}

export interface ScoreLine {
  id: number;
  year: number;
  line_type: string;
  school_id: number | null;
  major_id: number;
  total_score: number;
  politics: number | null;
  english: number | null;
  math: number | null;
  专业课: number | null;
}

export interface AdmissionData {
  id: number;
  year: number;
  school_id: number;
  major_id: number;
  total_applicants: number;
  admit_plan: number;
  admit_actual: number;
  admit_exempt: number;
  competition_ratio: number;
  avg_admit_score: number | null;
  min_admit_score: number | null;
  school_name?: string;
  school_tier?: string;
  major_name?: string;
  rank?: number;
}

export interface Recommendation {
  id?: number;
  school_major_id: number;
  school_id: number;
  school_name: string;
  school_tier: string;
  school_province?: string;
  major_id: number;
  major_name: string;
  major_code?: string;
  department?: string;
  total_score: number;
  rank: number;
  factors: {
    school_strength: number;
    major_match: number;
    admit_probability: number;
    region_match: number;
    career_prospect: number;
  };
  status?: string;
  notes?: string;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  province: string | null;
  undergraduate_school: string | null;
  grade: string | null;
  major_name: string | null;
  notes: string | null;
  role: string;
  is_active: boolean;
  profile: UserProfile | null;
}

export interface UserProfile {
  id: number;
  user_id: number;
  undergraduate: string | null;
  gpa: number | null;
  target_major_id: number | null;
  target_region: string | null;
  target_tier: string | null;
  self_assessment: string | null;
}

export interface Comment {
  id: number;
  school_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

export interface VisitLog {
  id: number;
  user_id: number | null;
  username: string | null;
  page: string;
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface VisitStats {
  totalVisits: number;
  uniqueIps: number;
  todayVisits: number;
  topPages: { page: string; count: number }[];
  hourly: { hour: string; count: number }[];
}

export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  province: string | null;
  undergraduate_school: string | null;
  grade: string | null;
  major_name: string | null;
  notes: string | null;
  role: string;
  is_active: number;
  created_at: string;
  gpa: number | null;
  target_major_id: number | null;
  visit_count: number;
  comment_count: number;
  rec_count: number;
  last_visit: string | null;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  students: number;
  consultants: number;
  admins: number;
  today: number;
}

export interface DataUpdateLog {
  id: number;
  source: string;
  status: string;
  records_added: number;
  records_updated: number;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data: T;
  pagination: Pagination | null;
  error: string | null;
}
