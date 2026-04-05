import { useState, useEffect } from 'react';
import { permissionApi } from '../api';
import type { Permission, PermissionCreate, PermissionUpdate } from '../types';
import { Button, Card, Badge, Modal, Input, Table } from '../components/ui';

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
      setError(err.response?.data?.detail || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      setError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await permissionApi.delete(id);
      fetchPermissions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Delete failed');
    }
  };

  const openEditModal = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({ name: permission.name, description: permission.description || '' });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingPermission(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const columns = [
    { key: 'id', label: 'ID', width: '80px' },
    {
      key: 'name',
      label: 'Name',
      render: (value: string) => <Badge variant="muted">{value}</Badge>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => value || '-',
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => (
        <span className="text-muted" style={{ fontSize: '13px' }}>
          {new Date(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      render: (_: any, row: any) => (
        <div className="actions">
          <Button variant="secondary" size="small" onClick={() => openEditModal(row)}>
            Edit
          </Button>
          <Button variant="danger" size="small" onClick={() => handleDelete(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-content">
      <div className="page-header flex-between">
        <h1>Permissions</h1>
        <Button variant="primary" onClick={openCreateModal}>
          Create
        </Button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <Card noPadding>
        <Table
          columns={columns}
          data={permissions}
          emptyText="No permissions"
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPermission ? 'Edit Permission' : 'Create Permission'}
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
            placeholder="e.g. create_user"
            required
          />
          <Input
            label="Description"
            value={formData.description || ''}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Permission description"
          />
        </form>
      </Modal>
    </div>
  );
}

export default Permissions;