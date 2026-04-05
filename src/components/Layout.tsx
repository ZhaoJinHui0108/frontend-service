import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import ChatSidebar from './ChatSidebar';

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
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Get user info from token
  const getUserFromToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };
  const user = getUserFromToken();

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
    navigate('/login');
  };

  const getUserInitial = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (user?.sub) return user.sub.charAt(0).toUpperCase();
    return 'U';
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
                className="btn btn-secondary btn-small"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-500)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {getUserInitial()}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.username || user?.sub || 'User'}
                </span>
                <span style={{ fontSize: '10px', transition: 'transform 0.2s', transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
              </button>
              
              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    minWidth: '220px',
                    overflow: 'hidden',
                    zIndex: 1000,
                  }}
                >
                  {/* User Info Section */}
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{user?.username || user?.sub || 'User'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>用户</div>
                    {user?.roles && Array.isArray(user.roles) && user.roles.length > 0 && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {user.roles.map((role: string) => (
                          <span
                            key={role}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              backgroundColor: 'var(--primary-100)',
                              color: 'var(--primary-700)',
                              borderRadius: '10px',
                            }}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
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