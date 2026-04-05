import axios from './index';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export interface FileContent {
  path: string;
  content: string;
}

export interface SaveResponse {
  path: string;
  content: string;
  git_message?: string;
}

export interface SearchResult {
  path: string;
  name: string;
  type: string;
  matched_in: string;
  snippet?: string;
}

export const noteApi = {
  getTree: (path: string = '') => {
    return axios.get<FileNode[]>('/notes/tree', { params: { path } });
  },

  getFile: (path: string) => {
    return axios.get<FileContent>('/notes/file', { params: { path } });
  },

  search: (keyword: string) => {
    return axios.get<SearchResult[]>('/notes/search', { params: { keyword } });
  },

  createFile: (path: string, content: string = '') => {
    return axios.post<SaveResponse>('/notes/file', { path, content });
  },

  updateFile: (path: string, content: string) => {
    return axios.put<SaveResponse>('/notes/file', { path, content });
  },

  deleteFile: (path: string) => {
    return axios.delete('/notes/file', { params: { path } });
  },

  createDirectory: (path: string) => {
    return axios.post('/notes/directory', null, { params: { path } });
  },
};