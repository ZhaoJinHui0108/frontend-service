import { useState, useEffect } from 'react';
import { noteApi, FileNode } from '../api/note';
import MDEditor from '@uiw/react-md-editor';
import { Card, Button } from '../components/ui';

function Notes() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string[]>([]);

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

  const findNode = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findNode(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const getChildrenOfPath = (path: string | null): FileNode[] => {
    if (!path) return tree;
    const node = findNode(tree, path);
    return node?.children || [];
  };

  const handleSelectItem = async (node: FileNode) => {
    if (node.type === 'directory') {
      const newExpanded = new Set(expandedDirs);
      if (newExpanded.has(node.path)) {
        newExpanded.delete(node.path);
      } else {
        newExpanded.add(node.path);
      }
      setExpandedDirs(newExpanded);
      setCurrentPath(prev => [...prev, node.name]);
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

  const handleBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(prev => prev.slice(0, -1));
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

  const renderTreeItems = (nodes: FileNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`tree-item ${selectedFile === node.path ? 'selected' : ''}`}
          style={{
            paddingLeft: level * 16 + 12 + 'px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px',
            marginBottom: '2px',
            transition: 'all 0.15s',
            fontSize: '13px',
          }}
          onClick={() => handleSelectItem(node)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
          }}
          onMouseLeave={(e) => {
            if (selectedFile !== node.path) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <span style={{ fontSize: '14px', color: 'var(--primary-500)' }}>
            {node.type === 'directory' ? (
              expandedDirs.has(node.path) ? '📂' : '📁'
            ) : (
              '📄'
            )}
          </span>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.name}
          </span>
          {node.type === 'directory' && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {expandedDirs.has(node.path) ? '▼' : '▶'}
            </span>
          )}
        </div>
        {node.type === 'directory' && expandedDirs.has(node.path) && node.children && (
          <div style={{ marginLeft: '8px' }}>
            {renderTreeItems(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const currentItems = getChildrenOfPath(currentPath.length > 0 ? 
    tree.find(t => t.name === currentPath[currentPath.length - 1])?.path || null 
    : null);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', margin: '-24px' }}>
      {/* Left Sidebar - Directory Tree */}
      <div style={{
        width: '280px',
        backgroundColor: 'white',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>📝 Notes</h3>
            {currentPath.length > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {currentPath.join(' / ')}
              </div>
            )}
          </div>
          <Button variant="ghost" size="small" onClick={handleRefresh} title="Refresh">
            ↻
          </Button>
        </div>

        {/* Breadcrumb */}
        {currentPath.length > 0 && (
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            <button
              onClick={() => setCurrentPath([])}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary-500)',
                padding: 0,
                fontSize: '12px',
              }}
            >
              根目录
            </button>
            {currentPath.map((p, i) => (
              <span key={i}>
                <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>/</span>
                <button
                  onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: i === currentPath.length - 1 ? 'var(--text-primary)' : 'var(--primary-500)',
                    padding: 0,
                    fontSize: '12px',
                  }}
                >
                  {p}
                </button>
              </span>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : currentPath.length === 0 ? (
            renderTreeItems(tree)
          ) : (
            <div>
              {currentItems.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  空目录
                </div>
              ) : (
                currentItems.map((node) => (
                  <div
                    key={node.path}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      borderRadius: '6px',
                      marginBottom: '4px',
                      transition: 'all 0.15s',
                      fontSize: '13px',
                    }}
                    onClick={() => handleSelectItem(node)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>
                      {node.type === 'directory' ? '📁' : '📄'}
                    </span>
                    <span style={{ flex: 1 }}>{node.name}</span>
                    {node.type === 'directory' && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▶</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
        {error && (
          <div style={{ padding: '16px 24px' }}>
            <div className="alert alert-error">{error}</div>
          </div>
        )}

        {selectedFile ? (
          <>
            <div style={{
              padding: '16px 24px',
              backgroundColor: 'white',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                  {selectedFile.split('/').pop()}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {selectedFile}
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              <Card style={{ height: '100%' }}>
                <div data-color-mode="light">
                  <MDEditor.Markdown source={content} style={{ padding: '0', minHeight: '400px' }} />
                </div>
              </Card>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>选择笔记</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                从左侧边栏选择要查看的笔记文件
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;
