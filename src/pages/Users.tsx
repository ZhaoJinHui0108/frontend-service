import { useState, useEffect } from 'react';
import { userApi, roleApi } from '../api';
import type { User, UserCreate, UserUpdate, Role } from '../types';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const getAvailableRoles = (userId: number) => {
    const assignedIds = new Set((userRoles[userId] || []).map(r => r.id));
    return roles.filter(r => !assignedIds.has(r.id));
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>用户管理</h1>
        <button className="btn btn-primary" onClick={() => { setEditingUser(null); setFormData({ username: '', email: '', password: '' }); setShowModal(true); }}>
          创建用户
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {users.map((user) => (
          <div key={user.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>{user.username}</h3>
                <p style={{ color: '#666', fontSize: 14 }}>{user.email}</p>
                <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                  {new Date(user.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => openEditModal(user)}>编辑</button>
                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleDelete(user.id)}>删除</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span className={`badge ${user.is_active ? 'badge-active' : 'badge-inactive'}`}>
                {user.is_active ? '激活' : '禁用'}
              </span>
              {user.is_superuser && <span className="badge badge-superuser">超级用户</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <button
                className={`btn btn-sm ${user.is_active ? 'btn-danger' : 'btn-primary'}`}
                style={{ padding: '2px 8px', fontSize: 12 }}
                onClick={() => handleToggleActive(user)}
              >
                {user.is_active ? '禁用' : '启用'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>角色 ({(userRoles[user.id] || []).length})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {(userRoles[user.id] || []).map((role) => (
                  <span key={role.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f6ffed', color: '#52c41a', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                    {role.name}
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52c41a', padding: 0, fontSize: 14, lineHeight: 1 }}
                      onClick={() => handleRemoveRole(user.id, role.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {getAvailableRoles(user.id).length > 0 && (
                <select
                  style={{ width: '100%', padding: 6, fontSize: 12, borderRadius: 4, border: '1px solid #d9d9d9' }}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignRole(user.id, Number(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">添加角色...</option>
                  {getAvailableRoles(user.id).map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#999' }}>
          暂无用户，点击上方按钮创建
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400 }}>
            <h3 style={{ marginBottom: 16 }}>{editingUser ? '编辑用户' : '创建用户'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingUser}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>密码 {editingUser && '(留空则不修改)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary">提交</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;