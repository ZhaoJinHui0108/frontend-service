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

export const noteApi = {
  getTree: (path: string = '') => {
    return axios.get<FileNode[]>('/notes/tree', { params: { path } });
  },

  getFile: (path: string) => {
    return axios.get<FileContent>('/notes/file', { params: { path } });
  },
};