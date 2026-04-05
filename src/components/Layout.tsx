import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import ChatSidebar from './ChatSidebar';
import { authApi } from '../api';

interface MenuItem {
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: '📊',
  },
  {
    label: 'AI 学习',
    path: '/ai-learning',
    icon: '🤖',
  },
  {
    label: '定时任务',
    path: '/scheduled-tasks',
    icon: '⏰',
  },
  {
    label: 'Notes',
    path: '/notes',
    icon: '📝',
  },
  {
    label: 'Users',
    icon: '👥',
    children: [
      { label: 'User List', path: '/users' },
      { label: 'Roles', path: '/roles' },
      { label: 'Permissions', path: '/permissions' },
    ],
  },
  {
    label: 'Settings',
    icon: '⚙️',
    children: [
      { label: 'Init', path: '/init' },
      { label: 'Sensitive Configs', path: '/sensitive-configs' },
    ],
  },
];

function MenuGroup({ item }: { item: MenuItem }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div className="menu-group">
        <button
          className="menu-parent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="menu-icon">{item.icon}</span>
          <span className="menu-label">{item.label}</span>
          <span className={`menu-arrow ${isOpen ? 'open' : ''}`}>▶</span>
        </button>
        {isOpen && (
          <div className="menu-children">
            {item.children!.map((child) => (
              <NavLink
                key={child.path}
                to={child.path!}
                className={({ isActive }) =>
                  `menu-child ${isActive ? 'active' : ''}`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path!}
      end
      className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
    >
      <span className="menu-icon">{item.icon}</span>
      <span className="menu-label">{item.label}</span>
    </NavLink>
  );
}

function Layout() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ username: string; email?: string } | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Get user info from /auth/me API
  useEffect(() => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      authApi.getMe().then((res) => {
        setUserInfo({ username: res.data.username, email: res.data.email });
      }).catch(() => {
        // Token invalid, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        navigate('/login');
      });
    }
  }, [navigate]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#3b82f6"/>
              <path d="M7 12L10 15L17 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Code Learning</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <MenuGroup key={item.label} item={item} />
          ))}
        </nav>
      </aside>
      <div className="layout-main" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'margin-right 0.3s ease',
        marginRight: isChatOpen ? '420px' : '0'
      }}>
        <header className="topbar">
          <div className="topbar-spacer" />
          <div className="topbar-actions">
            <button
              className="btn btn-primary btn-small"
              onClick={() => setIsChatOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🤖</span>
              <span>AI 助手</span>
            </button>
            
            {/* User Profile Dropdown */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-500) 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>
              
              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                    minWidth: '200px',
                    overflow: 'hidden',
                    zIndex: 1000,
                    animation: 'dropdownFadeIn 0.2s ease',
                  }}
                >
                  <style>{`
                    @keyframes dropdownFadeIn {
                      from { opacity: 0; transform: translateY(-8px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>
                  {/* User Info Section */}
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>{userInfo?.username || 'User'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{userInfo?.email || '用户'}</div>
                  </div>
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: 'var(--error)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--error-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span>🚪</span>
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      {/* Chat Sidebar - inline, pushes content */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '420px',
          height: '100vh',
          transform: isChatOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 998,
        }}
      >
        <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  );
}

export default Layout;