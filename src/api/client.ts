import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3456`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
