import { useState, useEffect } from 'react';
import { roleApi, permissionApi } from '../api';
import type { Role, RoleCreate, RoleUpdate, Permission } from '../types';
import { Button, Card, Badge, Modal, Input } from '../components/ui';

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
      setError(err.response?.data?.detail || 'Failed to load roles');
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      setError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await roleApi.delete(id);
      fetchRoles();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Delete failed');
    }
  };

  const handleAssignPermission = async (roleId: number, permissionId: number) => {
    try {
      await roleApi.assignPermission(roleId, permissionId);
      fetchRolePermissions(roleId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Assign permission failed');
    }
  };

  const handleRemovePermission = async (roleId: number, permissionId: number) => {
    try {
      await roleApi.removePermission(roleId, permissionId);
      fetchRolePermissions(roleId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Remove permission failed');
    }
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description || '' });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const getAvailablePermissions = (roleId: number) => {
    const assignedIds = new Set((rolePermissions[roleId] || []).map(p => p.id));
    return permissions.filter(p => !assignedIds.has(p.id));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-content">
      <div className="page-header flex-between">
        <h1>Roles</h1>
        <Button variant="primary" onClick={openCreateModal}>
          Create
        </Button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="card-grid">
        {roles.map((role) => (
          <Card key={role.id}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <div>
                <h3 style={{ marginBottom: '4px', fontSize: '18px', fontWeight: 600 }}>
                  {role.name}
                </h3>
                <p className="text-secondary" style={{ fontSize: '14px' }}>
                  {role.description || 'No description'}
                </p>
                <p className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                  {new Date(role.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-sm">
                <Button variant="secondary" size="small" onClick={() => openEditModal(role)}>
                  Edit
                </Button>
                <Button variant="danger" size="small" onClick={() => handleDelete(role.id)}>
                  Delete
                </Button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f2f3f5', paddingTop: '12px' }}>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, fontSize: '14px', color: '#45515e' }}>
                  Permissions ({(rolePermissions[role.id] || []).length})
                </span>
              </div>
              <div className="tag-list" style={{ marginBottom: '8px' }}>
                {(rolePermissions[role.id] || []).map((perm) => (
                  <Badge
                    key={perm.id}
                    variant="primary"
                    closable
                    onClose={() => handleRemovePermission(role.id, perm.id)}
                  >
                    {perm.name}
                  </Badge>
                ))}
              </div>
              {getAvailablePermissions(role.id).length > 0 && (
                <select
                  style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignPermission(role.id, Number(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Add permission...</option>
                  {getAvailablePermissions(role.id).map((perm) => (
                    <option key={perm.id} value={perm.id}>{perm.name}</option>
                  ))}
                </select>
              )}
            </div>
          </Card>
        ))}
      </div>

      {roles.length === 0 && (
        <Card>
          <div className="empty-state">
            <p>No roles</p>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRole ? 'Edit Role' : 'Create Role'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => handleSubmit()}>
              Submit
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
          />
          <Input
            label="Description"
            value={formData.description || ''}
            onChange={(value) => setFormData({ ...formData, description: value })}
          />
        </form>
      </Modal>
    </div>
  );
}

export default Roles;