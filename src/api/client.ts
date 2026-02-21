import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// TOKEN MANAGEMENT
// ============================================

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Axios interceptors — attach token and handle 401
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Authenticated fetch wrapper for pages that use raw fetch()
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {};

  // Copy existing headers
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => { headers[key] = value; });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => { headers[key] = value; });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

// Login function
export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; username: string; token: string }> {
  const response = await api.post('/api/login', { username, password });
  return response.data;
}

// Types
export interface CourseSpec {
  courseName: string;
  level: 'básico' | 'intermedio' | 'avanzado';
  objective: string;
  modules: Module[];
  metadata?: {
    sourceFileId?: string;
    parsedAt?: string;
  };
}

export interface Module {
  moduleNumber: number;
  moduleName: string;
  moduleResult?: string;
  topics: Topic[];
}

export interface Topic {
  topicNumber: string;
  topicName: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface JobStatus {
  status: 'running' | 'completed' | 'failed';
  progress: number;
  totalTopics: number;
  completedTopics: number;
  currentTopic: string;
  error?: string;
  report?: any;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

// Custom prompts
export interface CustomPrompts {
  moduleGeneration?: string;
  topicIndex?: string;
  topicDevelopment?: string;
}

const STORAGE_PREFIX = 'customPrompt_';

export function getCustomPrompts(): CustomPrompts | undefined {
  const prompts: CustomPrompts = {};
  const mg = localStorage.getItem(`${STORAGE_PREFIX}moduleGeneration`);
  const ti = localStorage.getItem(`${STORAGE_PREFIX}topicIndex`);
  const td = localStorage.getItem(`${STORAGE_PREFIX}topicDevelopment`);
  if (mg) prompts.moduleGeneration = mg;
  if (ti) prompts.topicIndex = ti;
  if (td) prompts.topicDevelopment = td;
  return Object.keys(prompts).length > 0 ? prompts : undefined;
}

// Load saved custom prompts from server and sync to localStorage.
// Call this once at app startup so custom prompts are available
// even if the user never visits the /prompts page.
let _syncDone = false;
export async function syncSavedPrompts(): Promise<void> {
  if (_syncDone) return;
  _syncDone = true;
  try {
    const res = await authFetch(`${API_BASE_URL}/api/prompts/saved`);
    const data = await res.json();
    if (data.success && data.prompts) {
      const keys: (keyof CustomPrompts)[] = ['moduleGeneration', 'topicIndex', 'topicDevelopment'];
      for (const key of keys) {
        if (data.prompts[key]) {
          localStorage.setItem(`${STORAGE_PREFIX}${key}`, data.prompts[key]);
        }
      }
    }
  } catch {
    // Server unreachable — will use defaults
  }
}

// API functions
export async function checkHealth() {
  const response = await api.get('/api/health');
  return response.data;
}

export async function validateConfig() {
  const response = await api.get('/api/config/validate');
  return response.data;
}

export async function parseFromDrive(fileId: string): Promise<{ success: boolean; courseSpec: CourseSpec }> {
  const response = await api.post('/api/parse/drive', { fileId });
  return response.data;
}

export async function parseManualContent(
  content: string,
  courseName?: string,
  level?: string,
  objective?: string
): Promise<{ success: boolean; courseSpec: CourseSpec }> {
  const response = await api.post('/api/parse/manual', {
    content,
    courseName,
    level,
    objective,
  });
  return response.data;
}

export async function startGeneration(params: {
  indexFileId?: string;
  rootFolderId?: string;
  courseSpec?: CourseSpec;
  customPrompts?: CustomPrompts;
}): Promise<{ success: boolean; jobId: string }> {
  const response = await api.post('/api/generate', params);
  return response.data;
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await api.get(`/api/jobs/${jobId}`);
  return response.data;
}

export async function listDriveFiles(folderId: string): Promise<{ files: DriveFile[] }> {
  const response = await api.get(`/api/drive/files/${folderId}`);
  return response.data;
}

export async function getDriveFileContent(fileId: string): Promise<{ content: string }> {
  const response = await api.get(`/api/drive/content/${fileId}`);
  return response.data;
}
