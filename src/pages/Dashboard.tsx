import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, userApi, roleApi, permissionApi } from '../api';
import { aiLearningApi } from '../api/aiLearning';
import { scheduledTasksApi } from '../api/scheduledTasks';
import type { UserWithRoles } from '../types';
import { Card, Badge } from '../components/ui';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [stats, setStats] = useState({ users: 0, roles: 0, permissions: 0, aiTasks: 0, scheduledTasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, usersRes, rolesRes, permissionsRes, aiTasksRes, scheduledTasksRes] = await Promise.all([
          authApi.getMe(),
          userApi.list().catch(() => ({ data: [] })),
          roleApi.list().catch(() => ({ data: [] })),
          permissionApi.list().catch(() => ({ data: [] })),
          aiLearningApi.listTasks().catch(() => ({ data: [] })),
          scheduledTasksApi.listTasks().catch(() => ({ data: [] })),
        ]);
        setUser(userRes.data);
        setStats({
          users: usersRes.data.length,
          roles: rolesRes.data.length,
          permissions: permissionsRes.data.length,
          aiTasks: aiTasksRes.data.length,
          scheduledTasks: scheduledTasksRes.data.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const moduleCards = [
    {
      title: 'AI-Learing',
      description: '机器学习模型训练与评估',
      icon: '🤖',
      iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: '/ai-learning',
      stats: `${stats.aiTasks} 个任务`,
      color: '#667eea',
    },
    {
      title: 'Scheduled Tasks',
      description: '自动化定时训练任务',
      icon: '⏰',
      iconBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      path: '/scheduled-tasks',
      stats: `${stats.scheduledTasks} 个任务`,
      color: '#f5576c',
    },
    {
      title: 'Notes',
      description: '学习笔记与文档',
      icon: '📝',
      iconBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      path: '/notes',
      stats: '',
      color: '#00f2fe',
    },
    {
      title: 'Users',
      description: '用户与权限管理',
      icon: '👥',
      iconBg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      path: '/users',
      stats: `${stats.users} 用户`,
      color: '#38f9d7',
    },
    {
      title: 'AI Chat',
      description: '与 AI 助手对话',
      icon: '💬',
      iconBg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      path: '/',
      stats: '',
      color: '#fee140',
    },
  ];

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="page-content">
      {/* Welcome Section */}
      <Card style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--primary-500) 0%, #667eea 100%)', border: 'none', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 600, color: 'white' }}>
              欢迎回来, {user?.username} 👋
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              {user?.is_superuser ? '超级管理员' : '普通用户'} | {user?.email}
            </p>
          </div>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </Card>

      {/* Module Cards */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>快速访问</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {moduleCards.map((module) => (
            <Card
              key={module.title}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                padding: 0,
              }}
              onClick={() => navigate(module.path)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div style={{
                padding: '20px',
                background: module.iconBg,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}>
                  {module.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'white' }}>
                    {module.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                    {module.description}
                  </p>
                </div>
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {module.stats}
                </span>
                <span style={{ fontSize: '12px', color: module.color }}>
                  访问 →
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              👥
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-500)' }}>
                {stats.users}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>用户</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(82, 196, 26, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              🔑
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>
                {stats.roles}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>角色</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(114, 46, 209, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              📋
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#722ed1' }}>
                {stats.permissions}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>权限</div>
            </div>
          </div>
        </Card>
      </div>

      {/* User Roles */}
      {user?.roles && user.roles.length > 0 && (
        <Card>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>我的角色</h3>
          <div className="tag-list">
            {user.roles.map((role) => (
              <Badge key={role.id} variant="primary">
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
