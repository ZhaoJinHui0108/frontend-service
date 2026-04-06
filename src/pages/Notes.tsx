import { useState, useEffect } from 'react';
import { noteApi, FileNode } from '../api/note';
import ReactMarkdown from 'react-markdown';

function Notes() {
  const [categories, setCategories] = useState<FileNode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryChildren, setCategoryChildren] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [error, setError] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await noteApi.getTree('');
      setCategories(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryChildren = async (categoryPath: string) => {
    try {
      setLoadingCategory(true);
      const { data } = await noteApi.getTree(categoryPath);
      setCategoryChildren(data);
    } catch (err: any) {
      console.error('Failed to load category children:', err);
    } finally {
      setLoadingCategory(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSelectCategory = async (node: FileNode) => {
    if (node.type !== 'directory') return;
    setSelectedCategory(node.path);
    setSelectedFile(null);
    setContent('');
    setExpandedDirs(new Set());
    await fetchCategoryChildren(node.path);
  };

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
    fetchCategories();
    if (selectedCategory) {
      fetchCategoryChildren(selectedCategory);
    }
    if (selectedFile) {
      noteApi.getFile(selectedFile).then(({ data }) => {
        setContent(data.content);
      }).catch(console.error);
    }
  };

  const handleRefreshCategory = () => {
    if (selectedCategory) {
      fetchCategoryChildren(selectedCategory);
    }
  };

  // Resolve a markdown link to a file path relative to current file
  const resolveMarkdownLink = (href: string): string | null => {
    if (!href || !selectedFile) return null;
    
    // Only handle relative links and .md links
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
      return null;
    }

    // Get the directory of the current file
    const currentDir = selectedFile.includes('/') 
      ? selectedFile.substring(0, selectedFile.lastIndexOf('/'))
      : '';
    
    // Resolve the href relative to current directory
    let resolvedPath = href;
    if (currentDir && !href.startsWith('/')) {
      resolvedPath = currentDir + '/' + href;
    }
    
    // Normalize path (handle ../ and ./)
    const parts = resolvedPath.split('/');
    const normalized: string[] = [];
    for (const part of parts) {
      if (part === '..') {
        normalized.pop();
      } else if (part !== '.' && part !== '') {
        normalized.push(part);
      }
    }
    
    return normalized.join('/');
  };

  // Find a file in the category children tree
  const findFileInTree = (nodes: FileNode[], targetPath: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === targetPath) return node;
      if (node.children) {
        const found = findFileInTree(node.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle click on a markdown link
  const handleMarkdownLinkClick = async (href: string) => {
    const resolvedPath = resolveMarkdownLink(href);
    if (!resolvedPath) return;

    // Try to find the file in current category children
    let targetNode = findFileInTree(categoryChildren, resolvedPath);
    
    // If not found and it's a .md file, try adding .md extension
    if (!targetNode && !resolvedPath.endsWith('.md')) {
      targetNode = findFileInTree(categoryChildren, resolvedPath + '.md');
    }

    if (targetNode) {
      if (targetNode.type === 'directory') {
        // Navigate into directory
        setSelectedCategory(targetNode.path);
        setSelectedFile(null);
        setContent('');
        setExpandedDirs(new Set());
        await fetchCategoryChildren(targetNode.path);
      } else {
        // Open the file
        await handleSelectFile(targetNode);
      }
    }
  };

  // Custom link component for markdown
  const MarkdownLink = ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith('http') || href?.startsWith('mailto:');
    
    if (isExternal) {
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    }

    return (
      <a 
        href={href} 
        onClick={(e) => {
          e.preventDefault();
          if (href) handleMarkdownLinkClick(href);
        }}
        style={{ color: 'var(--primary-500)', cursor: 'pointer' }}
        {...props}
      >
        {children}
      </a>
    );
  };

  const renderCategoryList = () => {
    return categories.map((node) => (
      <div
        key={node.path}
        className={`category-item ${selectedCategory === node.path ? 'selected' : ''}`}
        onClick={() => handleSelectCategory(node)}
      >
        <span className="category-icon">📁</span>
        <span className="category-name">{node.name}</span>
      </div>
    ));
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
      {/* Left Sidebar - Category List */}
      <aside className="notes-sidebar">
        <div className="sidebar-header">
          <h3>Notes</h3>
          <button className="btn btn-ghost btn-small" onClick={handleRefresh} title="Refresh">
            ↻
          </button>
        </div>

        <div className="category-list">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <p>No categories</p>
            </div>
          ) : (
            renderCategoryList()
          )}
        </div>
      </aside>

      {/* Middle Panel - Category Contents */}
      <aside className="notes-middle-panel">
        <div className="middle-panel-header">
          <h4>{selectedCategory ? selectedCategory.split('/').pop() : 'Select a category'}</h4>
          {selectedCategory && (
            <button className="btn btn-ghost btn-small" onClick={handleRefreshCategory} title="Refresh">
              ↻
            </button>
          )}
        </div>

        <div className="middle-panel-tree">
          {!selectedCategory ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <p>Select a category from the left</p>
            </div>
          ) : loadingCategory ? (
            <div className="loading">Loading...</div>
          ) : categoryChildren.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <p>Empty folder</p>
            </div>
          ) : (
            renderTree(categoryChildren)
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="notes-main-content">
        {error && (
          <div className="alert alert-error" style={{ margin: '16px' }}>
            {error}
          </div>
        )}

        {selectedFile ? (
          <>
            <div className="content-header">
              <h3>{selectedFile.split('/').pop()}</h3>
            </div>
            <div className="editor-wrapper" data-color-mode="light">
              <ReactMarkdown 
                components={{
                  a: MarkdownLink as any
                }}
              >
                {content}
              </ReactMarkdown>
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