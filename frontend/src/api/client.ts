// ── Types ────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  graduation_year: number | null;
  onboarding_complete: boolean;
  created_at: string;
}

export interface CareerGoal {
  id: number;
  user_id: number;
  label: string;
  target_industries: string[];
  target_roles: string[];
  target_locations: string[];
  target_firm_size: string | null;
  narrative: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Firm {
  id: number;
  name: string;
  industry: string | null;
  website: string | null;
  careers_url: string | null;
  notes: string | null;
}

export interface Job {
  id: number;
  user_id: number;
  career_goal_id: number | null;
  firm_id: number | null;
  firm: Firm | null;
  career_goal_label: string | null;
  title: string;
  url: string | null;
  description: string | null;
  location: string | null;
  match_score: number | null;
  match_rationale: string | null;
  status: string;
  discovered_at: string;
  applied_at: string | null;
}

export interface Resume {
  id: number;
  user_id: number;
  label: string;
  file_url: string;
  file_type: string;
  parent_resume_id: number | null;
  version: number;
  is_base: boolean;
  created_at: string;
}

export interface AlumniProfile {
  id: number;
  full_name: string;
  email: string | null;
  linkedin_url: string | null;
  graduation_year: number | null;
  current_company: string | null;
  current_title: string | null;
  industry: string | null;
  location: string | null;
  last_enriched_at: string | null;
}

export interface AlumniPage {
  alumni: AlumniProfile[];
  total: number;
  page: number;
  pages: number;
}

export interface FirmCoverage {
  coverage: { firm_name: string; alumni_count: number }[];
  target_industries: string[];
}

export interface DashboardStats {
  jobs: { total: number; by_status: Record<string, number> };
  career_goals: { active: number };
  resumes: { total: number };
  recent_jobs: Job[];
}

// ── HTTP helper ──────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data as T;
}

async function requestMultipart<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data as T;
}

// ── Auth ─────────────────────────────────────────────────────────────

export function login(email: string, password: string) {
  return request<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(data: {
  email: string;
  password: string;
  full_name?: string;
  graduation_year?: number;
}) {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function logout() {
  return request<{ message: string }>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return request<User>("/auth/me");
}

export function completeOnboarding(full_name: string, graduation_year: number) {
  return request<User>("/auth/onboarding", {
    method: "PUT",
    body: JSON.stringify({ full_name, graduation_year }),
  });
}

// ── Career Goals ─────────────────────────────────────────────────────

export function getCareerGoals() {
  return request<CareerGoal[]>("/career-goals/");
}

export function createCareerGoal(data: Partial<CareerGoal>) {
  return request<CareerGoal>("/career-goals/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCareerGoal(id: number, data: Partial<CareerGoal>) {
  return request<CareerGoal>(`/career-goals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCareerGoal(id: number) {
  return request<{ message: string }>(`/career-goals/${id}`, {
    method: "DELETE",
  });
}

// ── Jobs ─────────────────────────────────────────────────────────────

export function getJobs(params?: { status?: string; career_goal_id?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.career_goal_id)
    query.set("career_goal_id", String(params.career_goal_id));
  const qs = query.toString();
  return request<Job[]>(`/jobs/${qs ? `?${qs}` : ""}`);
}

export function createJob(data: {
  title: string;
  firm_name?: string;
  firm_id?: number;
  career_goal_id?: number;
  url?: string;
  description?: string;
  location?: string;
  status?: string;
}) {
  return request<Job>("/jobs/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateJob(id: number, data: Partial<Job>) {
  return request<Job>(`/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteJob(id: number) {
  return request<{ message: string }>(`/jobs/${id}`, { method: "DELETE" });
}

// ── Resumes ──────────────────────────────────────────────────────────

export function getResumes() {
  return request<Resume[]>("/resumes/");
}

export function uploadResume(file: File, label: string, isBase: boolean) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label);
  formData.append("is_base", String(isBase));
  return requestMultipart<Resume>("/resumes/", formData);
}

export function updateResume(id: number, data: { label?: string; is_base?: boolean }) {
  return request<Resume>(`/resumes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteResume(id: number) {
  return request<{ message: string }>(`/resumes/${id}`, { method: "DELETE" });
}

// ── Firms ────────────────────────────────────────────────────────────

export function getFirms() {
  return request<Firm[]>("/firms/");
}

export function createFirm(data: Partial<Firm>) {
  return request<Firm>("/firms/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Alumni ───────────────────────────────────────────────────────────

export function searchAlumni(params: {
  q?: string;
  company?: string;
  location?: string;
  page?: number;
  per_page?: number;
}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.company) query.set("company", params.company);
  if (params.location) query.set("location", params.location);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  return request<AlumniPage>(`/alumni/?${query.toString()}`);
}

export function getFirmCoverage() {
  return request<FirmCoverage>("/alumni/firm-coverage");
}

// ── Dashboard ────────────────────────────────────────────────────────

export function getDashboardStats() {
  return request<DashboardStats>("/dashboard/stats");
}

// ── Chat ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ToolAction {
  tool: string;
  input: Record<string, unknown>;
  result_preview: string;
}

export interface ChatResponse {
  response: string;
  tool_actions: ToolAction[];
}

export function sendChatMessage(messages: ChatMessage[]) {
  return request<ChatResponse>("/chat/message", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}
