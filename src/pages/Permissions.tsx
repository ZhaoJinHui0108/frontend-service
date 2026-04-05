import { useState, useEffect } from 'react';
import { permissionApi } from '../api';
import type { Permission, PermissionCreate, PermissionUpdate } from '../types';

function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState<PermissionCreate>({ name: '', description: '' });

  const fetchPermissions = async () => {
    try {
      const { data } = await permissionApi.list();
      setPermissions(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || '获取权限列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingPermission) {
        const updateData: PermissionUpdate = {};
        if (formData.name) updateData.name = formData.name;
        if (formData.description !== undefined) updateData.description = formData.description;
        await permissionApi.update(editingPermission.id, updateData);
      } else {
        await permissionApi.create(formData);
      }
      setShowModal(false);
      setEditingPermission(null);
      setFormData({ name: '', description: '' });
      fetchPermissions();
    } catch (err: any) {
      setError(err.response?.data?.detail || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个权限吗？')) return;
    try {
      await permissionApi.delete(id);
      fetchPermissions();
    } catch (err: any) {
      setError(err.response?.data?.detail || '删除失败');
    }
  };

  const openEditModal = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({ name: permission.name, description: permission.description || '' });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>权限管理</h1>
        <button className="btn btn-primary" onClick={() => { setEditingPermission(null); setFormData({ name: '', description: '' }); setShowModal(true); }}>
          创建权限
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>描述</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.id}>
                <td>{permission.id}</td>
                <td>{permission.name}</td>
                <td>{permission.description || '-'}</td>
                <td>{new Date(permission.created_at).toLocaleString()}</td>
                <td className="actions">
                  <button className="btn btn-secondary" onClick={() => openEditModal(permission)}>编辑</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(permission.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {permissions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#999' }}>
          暂无权限，点击上方按钮创建
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400 }}>
            <h3 style={{ marginBottom: 16 }}>{editingPermission ? '编辑权限' : '创建权限'}</h3>
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

export default Permissions;