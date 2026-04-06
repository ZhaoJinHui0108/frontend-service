import { useState, useEffect } from 'react';
import { noteApi, FileNode } from '../api/note';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '../components/ui';

function Notes() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const fetchTree = async () => {
    try {
      setLoading(true);
      const { data } = await noteApi.getTree('');
      setTree(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const handleSelectFile = async (node: FileNode) => {
    if (node.type === 'directory') {
      const newExpanded = new Set(expandedDirs);
      if (newExpanded.has(node.path)) {
        newExpanded.delete(node.path);
      } else {
        newExpanded.add(node.path);
      }
      setExpandedDirs(newExpanded);
      return;
    }

    try {
      const { data } = await noteApi.getFile(node.path);
      setSelectedFile(node.path);
      setContent(data.content);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load file');
    }
  };

  const handleRefresh = () => {
    fetchTree();
    if (selectedFile) {
      noteApi.getFile(selectedFile).then(({ data }) => {
        setContent(data.content);
      }).catch(console.error);
    }
  };

  const renderTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`tree-item ${selectedFile === node.path ? 'selected' : ''}`}
          style={{ paddingLeft: level * 16 + 8 + 'px' }}
          onClick={() => handleSelectFile(node)}
        >
          <span className="tree-icon">
            {node.type === 'directory' ? (expandedDirs.has(node.path) ? '[-]' : '[+]') : (selectedFile === node.path ? '>' : 'o')}
          </span>
          <span className="tree-name">{node.name}</span>
        </div>
        {node.type === 'directory' && expandedDirs.has(node.path) && node.children && (
          <div className="tree-children">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="notes-layout">
      <aside className="notes-sidebar">
        <div className="sidebar-header">
          <h3>Notes</h3>
          <button className="btn btn-ghost btn-small" onClick={handleRefresh} title="Refresh">
            ↻
          </button>
        </div>

        <div className="sidebar-tree">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            renderTree(tree)
          )}
        </div>
      </aside>

      <main className="notes-content">
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {selectedFile ? (
          <>
            <div className="content-header">
              <h3>{selectedFile.split('/').pop()}</h3>
            </div>
            <div className="editor-wrapper" data-color-mode="light">
              <MDEditor.Markdown source={content} style={{ padding: '16px' }} />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Select a file to view</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Notes;
