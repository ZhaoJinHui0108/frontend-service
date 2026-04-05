import { useState, useEffect } from 'react';
import { userApi, roleApi } from '../api';
import type { User, UserCreate, UserUpdate, Role } from '../types';
import { Button, Card, Badge, Modal, Input, Select } from '../components/ui';

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<number, Role[]>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserCreate & Partial<UserUpdate>>({
    username: '',
    email: '',
    password: '',
  });

  const fetchUsers = async () => {
    try {
      const { data } = await userApi.list();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await roleApi.list();
      setRoles(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchUserRoles = async (userId: number) => {
    try {
      const { data: user } = await userApi.get(userId);
      setUserRoles(prev => ({ ...prev, [userId]: user.roles || [] }));
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    users.forEach(user => {
      if (!userRoles[user.id]) {
        fetchUserRoles(user.id);
      }
    });
  }, [users]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    try {
      if (editingUser) {
        const updateData: UserUpdate = {};
        if (formData.email) updateData.email = formData.email;
        if (formData.password) updateData.password = formData.password;
        await userApi.update(editingUser.id, updateData);
      } else {
        await userApi.create(formData as UserCreate);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个用户吗？')) return;
    try {
      await userApi.delete(id);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || '删除失败');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userApi.update(user.id, { is_active: !user.is_active });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || '更新状态失败');
    }
  };

  const handleAssignRole = async (userId: number, roleId: number) => {
    try {
      await roleApi.assignRoleToUser(userId, roleId);
      fetchUserRoles(userId);
    } catch (err: any) {
      setError(err.response?.data?.detail || '分配角色失败');
    }
  };

  const handleRemoveRole = async (userId: number, roleId: number) => {
    try {
      await roleApi.removeRoleFromUser(userId, roleId);
      fetchUserRoles(userId);
    } catch (err: any) {
      setError(err.response?.data?.detail || '移除角色失败');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email, password: '' });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '' });
    setShowModal(true);
  };

  const getAvailableRoles = (userId: number) => {
    const assignedIds = new Set((userRoles[userId] || []).map(r => r.id));
    return roles.filter(r => !assignedIds.has(r.id));
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="page-content">
      <div className="page-header flex-between">
        <h1>用户管理</h1>
        <Button variant="primary" onClick={openCreateModal}>
          创建用户
        </Button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="card-grid">
        {users.map((user) => (
          <Card key={user.id}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <div>
                <h3 style={{ marginBottom: '4px', fontSize: '18px', fontWeight: 600 }}>
                  {user.username}
                </h3>
                <p className="text-secondary" style={{ fontSize: '14px' }}>
                  {user.email}
                </p>
                <p className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                  {new Date(user.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-sm">
                <Button variant="secondary" size="small" onClick={() => openEditModal(user)}>
                  编辑
                </Button>
                <Button variant="danger" size="small" onClick={() => handleDelete(user.id)}>
                  删除
                </Button>
              </div>
            </div>

            <div className="flex gap-sm" style={{ marginBottom: '12px' }}>
              <Badge variant={user.is_active ? 'success' : 'error'}>
                {user.is_active ? '激活' : '禁用'}
              </Badge>
              {user.is_superuser && <Badge variant="primary">超级用户</Badge>}
            </div>

            <Button
              variant={user.is_active ? 'secondary' : 'primary'}
              size="small"
              onClick={() => handleToggleActive(user)}
            >
              {user.is_active ? '禁用' : '启用'}
            </Button>

            <div style={{ borderTop: '1px solid #f2f3f5', paddingTop: '12px', marginTop: '12px' }}>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, fontSize: '14px', color: '#45515e' }}>
                  角色 ({(userRoles[user.id] || []).length})
                </span>
              </div>
              <div className="tag-list" style={{ marginBottom: '8px' }}>
                {(userRoles[user.id] || []).map((role) => (
                  <Badge key={role.id} variant="success" closable onClose={() => handleRemoveRole(user.id, role.id)}>
                    {role.name}
                  </Badge>
                ))}
              </div>
              {getAvailableRoles(user.id).length > 0 && (
                <Select
                  value=""
                  onChange={(value) => {
                    if (value) {
                      handleAssignRole(user.id, Number(value));
                    }
                  }}
                  options={getAvailableRoles(user.id).map((role) => ({
                    label: role.name,
                    value: role.id,
                  }))}
                  placeholder="添加角色..."
                />
              )}
            </div>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <div className="empty-state">
            <p>暂无用户，点击上方按钮创建</p>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? '编辑用户' : '创建用户'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={() => handleSubmit()}>
              提交
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="用户名"
            value={formData.username}
            onChange={(value) => setFormData({ ...formData, username: value })}
            disabled={!!editingUser}
            required={!editingUser}
          />
          <Input
            label="邮箱"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            required
          />
          <Input
            label={`密码 ${editingUser ? '(留空则不修改)' : ''}`}
            type="password"
            value={formData.password}
            onChange={(value) => setFormData({ ...formData, password: value })}
            required={!editingUser}
          />
        </form>
      </Modal>
    </div>
  );
}

export default Users;
