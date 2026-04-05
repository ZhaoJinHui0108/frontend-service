import { useState, useEffect } from 'react';
import { roleApi, permissionApi } from '../api';
import type { Role, RoleCreate, RoleUpdate, Permission } from '../types';

function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<number, Permission[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleCreate>({ name: '', description: '' });

  const fetchRoles = async () => {
    try {
      const { data } = await roleApi.list();
      setRoles(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || '获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data } = await permissionApi.list();
      setPermissions(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const { data: role } = await roleApi.get(roleId);
      setRolePermissions(prev => ({ ...prev, [roleId]: role.permissions || [] }));
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    roles.forEach(role => {
      if (!rolePermissions[role.id]) {
        fetchRolePermissions(role.id);
      }
    });
  }, [roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingRole) {
        const updateData: RoleUpdate = {};
        if (formData.name) updateData.name = formData.name;
        if (formData.description !== undefined) updateData.description = formData.description;
        await roleApi.update(editingRole.id, updateData);
      } else {
        await roleApi.create(formData);
      }
      setShowModal(false);
      setEditingRole(null);
      setFormData({ name: '', description: '' });
      fetchRoles();
    } catch (err: any) {
      setError(err.response?.data?.detail || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个角色吗？')) return;
    try {
      await roleApi.delete(id);
      fetchRoles();
    } catch (err: any) {
      setError(err.response?.data?.detail || '删除失败');
    }
  };

  const handleAssignPermission = async (roleId: number, permissionId: number) => {
    try {
      await roleApi.assignPermission(roleId, permissionId);
      fetchRolePermissions(roleId);
    } catch (err: any) {
      setError(err.response?.data?.detail || '分配权限失败');
    }
  };

  const handleRemovePermission = async (roleId: number, permissionId: number) => {
    try {
      await roleApi.removePermission(roleId, permissionId);
      fetchRolePermissions(roleId);
    } catch (err: any) {
      setError(err.response?.data?.detail || '移除权限失败');
    }
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description || '' });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const getAvailablePermissions = (roleId: number) => {
    const assignedIds = new Set((rolePermissions[roleId] || []).map(p => p.id));
    return permissions.filter(p => !assignedIds.has(p.id));
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>角色管理</h1>
        <button className="btn btn-primary" onClick={() => { setEditingRole(null); setFormData({ name: '', description: '' }); setShowModal(true); }}>
          创建角色
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {roles.map((role) => (
          <div key={role.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>{role.name}</h3>
                <p style={{ color: '#666', fontSize: 14 }}>{role.description || '无描述'}</p>
                <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                  {new Date(role.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => openEditModal(role)}>编辑</button>
                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleDelete(role.id)}>删除</button>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>权限 ({(rolePermissions[role.id] || []).length})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {(rolePermissions[role.id] || []).map((perm) => (
                  <span key={perm.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e6f7ff', color: '#1890ff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                    {perm.name}
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1890ff', padding: 0, fontSize: 14, lineHeight: 1 }}
                      onClick={() => handleRemovePermission(role.id, perm.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {getAvailablePermissions(role.id).length > 0 && (
                <select
                  style={{ width: '100%', padding: 6, fontSize: 12, borderRadius: 4, border: '1px solid #d9d9d9' }}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignPermission(role.id, Number(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">添加权限...</option>
                  {getAvailablePermissions(role.id).map((perm) => (
                    <option key={perm.id} value={perm.id}>{perm.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#999' }}>
          暂无角色，点击上方按钮创建
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400 }}>
            <h3 style={{ marginBottom: 16 }}>{editingRole ? '编辑角色' : '创建角色'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default Roles;