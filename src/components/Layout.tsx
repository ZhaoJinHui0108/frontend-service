import { Outlet, NavLink, useNavigate } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div>
      <nav className="nav">
        <div className="nav-brand">用户管理系统</div>
        <div className="nav-links">
          <NavLink to="/" end>仪表盘</NavLink>
          <NavLink to="/users">用户</NavLink>
          <NavLink to="/roles">角色</NavLink>
          <NavLink to="/permissions">权限</NavLink>
          <NavLink to="/init">初始化</NavLink>
        </div>
        <button className="btn btn-secondary" onClick={handleLogout}>
          退出
        </button>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;