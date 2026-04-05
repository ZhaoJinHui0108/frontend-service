import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
      <div className="layout-main">
        <header className="topbar">
          <div className="topbar-spacer" />
          <div className="topbar-actions">
            <button className="btn btn-secondary btn-small" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;