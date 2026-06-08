import client from './client';
import type { APIResponse, School, Major, ScoreLine, AdmissionData, Recommendation, User, DataUpdateLog, Comment, AdminUser, UserStats, VisitLog, VisitStats } from '../types';

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
  phone: string;
  province?: string;
  undergraduate_school?: string;
  grade?: string;
  major_name?: string;
  notes?: string;
  sms_code?: string;
}

// Auth
export const auth = {
  login: (username: string, password: string) =>
    client.post<APIResponse<{ access_token: string }>>('/auth/login', { username, password }),
  register: (data: RegisterData) =>
    client.post<APIResponse<{ id: number; username: string }>>('/auth/register', data),
  sendSms: (phone: string) =>
    client.post<APIResponse<{ phone: string; code: string; message: string }>>('/auth/send-sms', { phone }),
  verifySms: (phone: string, code: string) =>
    client.post<APIResponse<{ verified: boolean }>>('/auth/verify-sms', { phone, code }),
  me: () => client.get<APIResponse<User>>('/auth/me'),
  updateProfile: (data: Record<string, unknown>) =>
    client.put<APIResponse<Record<string, unknown>>>('/auth/profile', data),
};

// Schools
export const schools = {
  list: (params: Record<string, string | number>) =>
    client.get<APIResponse<School[]>>('/schools', { params }),
  get: (id: number) => client.get<APIResponse<School>>(`/schools/${id}`),
  getMajors: (id: number) => client.get<APIResponse<Record<string, unknown>[]>>(`/schools/${id}/majors`),
  getMajorsDetail: (id: number) => client.get<APIResponse<Record<string, unknown>[]>>(`/schools/${id}/majors-detail`),
};

// Majors
export const majors = {
  list: (params: Record<string, string | number>) =>
    client.get<APIResponse<Major[]>>('/majors', { params }),
  get: (id: number) => client.get<APIResponse<Major>>(`/majors/${id}`),
  getSchools: (id: number) => client.get<APIResponse<Record<string, unknown>[]>>(`/majors/${id}/schools`),
  getNationalLines: (id: number, years?: string) =>
    client.get<APIResponse<Record<string, unknown>[]>>(`/majors/${id}/national-lines`, { params: { years } }),
  getDifficulty: (year?: number) =>
    client.get<APIResponse<Record<string, unknown>[]>>('/majors/difficulty/overview', { params: year ? { year } : {} }),
};

// Score Lines
export const scoreLines = {
  list: (params: Record<string, string | number>) =>
    client.get<APIResponse<ScoreLine[]>>('/score-lines', { params }),
  compare: (data: { school_ids: number[]; major_id: number; years?: number[] }) =>
    client.post<APIResponse<Record<string, unknown>[]>>('/score-lines/compare', data),
  trend: (params: Record<string, string | number>) =>
    client.get<APIResponse<ScoreLine[]>>('/score-lines/trend', { params }),
};

// Admissions
export const admissions = {
  rankings: (params: Record<string, string | number>) =>
    client.get<APIResponse<AdmissionData[]>>('/admissions/rankings', { params }),
  competition: (schoolId: number, majorId: number) =>
    client.get<APIResponse<Record<string, unknown>[]>>(`/admissions/competition/${schoolId}/${majorId}`),
  list: (params: Record<string, string | number>) =>
    client.get<APIResponse<AdmissionData[]>>('/admissions', { params }),
};

// Recommendations
export const recommendations = {
  generate: () => client.post<APIResponse<Recommendation[]>>('/recommendations/generate'),
  list: () => client.get<APIResponse<Recommendation[]>>('/recommendations'),
  get: (id: number) => client.get<APIResponse<Recommendation>>(`/recommendations/${id}`),
};

// Admin
export const admin = {
  stats: () => client.get<APIResponse<Record<string, unknown>>>('/admin/stats'),
  scrapeLogs: () => client.get<APIResponse<DataUpdateLog[]>>('/admin/scrape/logs'),
  // User management
  listUsers: (params?: Record<string, string | number>) =>
    client.get<APIResponse<AdminUser[]>>('/admin/users', { params }),
  getUserStats: () => client.get<APIResponse<UserStats>>('/admin/users/stats'),
  toggleUser: (id: number) => client.put<APIResponse<{ id: number; is_active: boolean; message: string }>>(`/admin/users/${id}/toggle`),
  deleteUser: (id: number) => client.delete<APIResponse<{ deleted: boolean; id: number }>>(`/admin/users/${id}`),
  // Visit tracking
  listVisits: (params?: Record<string, string | number>) =>
    client.get<APIResponse<VisitLog[]>>('/visits', { params }),
  visitStats: () => client.get<APIResponse<VisitStats>>('/visits/stats'),
};

// Visit tracking (public)
export const visits = {
  track: (page: string) => client.post<APIResponse<{ recorded: boolean }>>('/visits', { page }),
};

// Comments
export const comments = {
  list: (schoolId: number, params?: Record<string, string | number>) =>
    client.get<APIResponse<Comment[]>>(`/schools/${schoolId}/comments`, { params }),
  create: (schoolId: number, content: string) =>
    client.post<APIResponse<Comment>>(`/schools/${schoolId}/comments`, { content }),
  delete: (commentId: number) =>
    client.delete<APIResponse<{ deleted: boolean }>>(`/comments/${commentId}`),
};
