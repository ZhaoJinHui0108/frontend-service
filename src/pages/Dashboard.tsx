import { useState, useEffect } from 'react';
import { authApi, userApi, roleApi, permissionApi } from '../api';
import type { UserWithRoles } from '../types';

function Dashboard() {
  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [stats, setStats] = useState({ users: 0, roles: 0, permissions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, usersRes, rolesRes, permissionsRes] = await Promise.all([
          authApi.getMe(),
          userApi.list().catch(() => ({ data: [] })),
          roleApi.list().catch(() => ({ data: [] })),
          permissionApi.list().catch(() => ({ data: [] })),
        ]);
        setUser(userRes.data);
        setStats({
          users: usersRes.data.length,
          roles: rolesRes.data.length,
          permissions: permissionsRes.data.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>仪表盘</h1>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3>欢迎, {user?.username}</h3>
        <p style={{ color: '#666' }}>
          {user?.is_superuser ? '超级管理员' : '普通用户'} | {user?.email}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="card">
          <h4>用户数量</h4>
          <p style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>{stats.users}</p>
        </div>
        <div className="card">
          <h4>角色数量</h4>
          <p style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>{stats.roles}</p>
        </div>
        <div className="card">
          <h4>权限数量</h4>
          <p style={{ fontSize: 32, fontWeight: 'bold', color: '#722ed1' }}>{stats.permissions}</p>
        </div>
      </div>

      {user?.roles && user.roles.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h4 style={{ marginBottom: 12 }}>我的角色</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {user.roles.map((role) => (
              <span key={role.id} className="badge badge-active">
                {role.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;