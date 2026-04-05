import { useState, useEffect } from 'react';
import { authApi, userApi, roleApi, permissionApi } from '../api';
import type { UserWithRoles } from '../types';
import { Card, Badge } from '../components/ui';

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
    <div className="page-content">
      <div className="page-header">
        <h1>仪表盘</h1>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 600 }}>
          欢迎, {user?.username}
        </h3>
        <p className="text-secondary" style={{ fontSize: '14px' }}>
          {user?.is_superuser ? '超级管理员' : '普通用户'} | {user?.email}
        </p>
      </Card>

      <div className="stats-grid">
        <Card>
          <h4>用户数量</h4>
          <div className="value users">{stats.users}</div>
        </Card>
        <Card>
          <h4>角色数量</h4>
          <div className="value roles">{stats.roles}</div>
        </Card>
        <Card>
          <h4>权限数量</h4>
          <div className="value permissions">{stats.permissions}</div>
        </Card>
      </div>

      {user?.roles && user.roles.length > 0 && (
        <Card title="我的角色">
          <div className="tag-list">
            {user.roles.map((role) => (
              <Badge key={role.id} variant="success">
                {role.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
