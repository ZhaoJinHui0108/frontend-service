import { useState, useEffect } from 'react';
import { noteApi, FileNode, SearchResult } from '../api/note';
import { Button, Input } from '../components/ui';
import MDEditor from '@uiw/react-md-editor';

function Notes() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newType, setNewType] = useState<'file' | 'directory'>('file');
  const [newPath, setNewPath] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  // Search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchTree = async (path: string = '') => {
    try {
      const { data } = await noteApi.getTree(path);
      if (path === '') {
        setTree(data);
      }
      return data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  // Search effect
  useEffect(() => {
    if (searchKeyword.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await noteApi.search(searchKeyword);
        setSearchResults(data);
      } catch (err: any) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleSelectFile = async (node: FileNode) => {
    // Close modal if open when selecting
    if (showNewModal) {
      setShowNewModal(false);
    }
    
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
      setOriginalContent(data.content);
      setIsEditing(false);
      setError('');
      setSearchKeyword('');
      setSearchResults([]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load file');
    }
  };

  const handleSearchSelect = async (result: SearchResult) => {
    try {
      const { data } = await noteApi.getFile(result.path);
      setSelectedFile(result.path);
      setContent(data.content);
      setOriginalContent(data.content);
      setIsEditing(false);
      setError('');
      setSearchKeyword('');
      setSearchResults([]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load file');
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setError('');
    setSuccess('');
    try {
      const result = await noteApi.updateFile(selectedFile, content);
      setOriginalContent(content);
      setIsEditing(false);
      setSuccess(result.data.git_message || 'Saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    }
  };

  const handleCreate = async () => {
    if (!newPath.trim()) return;
    setError('');
    setSuccess('');
    try {
      if (newType === 'file') {
        const fileName = newPath.split('/').pop() || 'new-file';
        const result = await noteApi.createFile(newPath, '# ' + fileName + '\n\n');
        setSuccess(result.data.git_message || 'Created successfully');
      } else {
        await noteApi.createDirectory(newPath);
        setSuccess('Directory created successfully');
      }
      setShowNewModal(false);
      setNewPath('');
      fetchTree();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create');
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm('Are you sure?')) return;
    setError('');
    setSuccess('');
    try {
      await noteApi.deleteFile(path);
      if (selectedFile === path) {
        setSelectedFile(null);
        setContent('');
      }
      setSuccess('Deleted successfully');
      fetchTree();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete');
    }
  };

  const handleRefresh = () => {
    fetchTree();
    if (selectedFile) {
      noteApi.getFile(selectedFile).then(({ data }) => {
        setContent(data.content);
        setOriginalContent(data.content);
      }).catch(console.error);
    }
  };

  const renderTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className="tree-item"
          style={{ paddingLeft: level * 16 + 8 + 'px' }}
          onClick={() => handleSelectFile(node)}
        >
          <span className="tree-icon">
            {node.type === 'directory' ? (expandedDirs.has(node.path) ? '[-]' : '[+]') : '[f]'}
          </span>
          <span className="tree-name">{node.name}</span>
          {node.type === 'file' && (
            <button
              className="tree-delete"
              onClick={(e) => { e.stopPropagation(); handleDelete(node.path); }}
            >
              x
            </button>
          )}
        </div>
        {node.type === 'directory' && expandedDirs.has(node.path) && node.children && (
          <div className="tree-children">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const hasChanges = content !== originalContent;

  return (
    <div className="notes-layout">
      <aside className="notes-sidebar">
        <div className="sidebar-header">
          <h3>Notes</h3>
          <div className="sidebar-actions">
            <button className="btn btn-ghost btn-small" onClick={handleRefresh} title="Refresh">
              &#8635;
            </button>
            <Button variant="ghost" size="small" onClick={() => setShowNewModal(true)}>
              +New
            </Button>
          </div>
        </div>

        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sidebar-tree">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : searchResults.length > 0 ? (
            <div className="search-results">
              {isSearching ? (
                <div className="loading">Searching...</div>
              ) : (
                searchResults.map((result) => (
                  <div
                    key={result.path}
                    className="search-result-item"
                    onClick={() => handleSearchSelect(result)}
                  >
                    <div className="search-result-name">{result.name}</div>
                    <div className="search-result-path">{result.path}</div>
                    {result.snippet && (
                      <div className="search-result-snippet">{result.snippet}</div>
                    )}
                  </div>
                ))
              )}
            </div>
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
        {success && (
          <div className="alert alert-success" style={{ marginBottom: '16px' }}>
            {success}
          </div>
        )}

        {selectedFile ? (
          <>
            <div className="content-header">
              <h3>{selectedFile.split('/').pop()}</h3>
              <div className="content-actions">
                {isEditing ? (
                  <>
                    <Button variant="secondary" size="small" onClick={() => { setIsEditing(false); setContent(originalContent); }}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="small" onClick={handleSave} disabled={!hasChanges}>
                      Save
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" size="small" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
            </div>
            <div className="editor-wrapper" data-color-mode="light">
              {isEditing ? (
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  height="100%"
                  preview="edit"
                />
              ) : (
                <MDEditor.Markdown source={content} style={{ padding: '16px' }} />
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Select a file to view or edit</p>
          </div>
        )}
      </main>

      <div className={`modal-overlay ${showNewModal ? '' : 'hidden'}`} onClick={() => setShowNewModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">New</h3>
            <button className="modal-close" onClick={() => setShowNewModal(false)}>x</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'file' | 'directory')}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              >
                <option value="file">File</option>
                <option value="directory">Directory</option>
              </select>
            </div>
            <Input
              label="Path"
              value={newPath}
              onChange={setNewPath}
              placeholder={newType === 'file' ? 'python/notes.md' : 'new-folder'}
            />
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setShowNewModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notes;