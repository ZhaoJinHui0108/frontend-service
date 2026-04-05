import { useState, useEffect } from 'react';
import { sensitiveConfigApi, SensitiveConfig, SensitiveConfigCreate } from '../api/sensitiveConfig';
import { Button, Input } from '../components/ui';

function SensitiveConfigs() {
  const [configs, setConfigs] = useState<SensitiveConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editConfig, setEditConfig] = useState<SensitiveConfig | null>(null);
  const [formData, setFormData] = useState<SensitiveConfigCreate>({
    key: '',
    value: '',
    description: '',
  });

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const { data } = await sensitiveConfigApi.getConfigs();
      setConfigs(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load configs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSubmit = async () => {
    if (!formData.key.trim() || !formData.value.trim()) {
      setError('Key and value are required');
      return;
    }

    try {
      if (editConfig) {
        await sensitiveConfigApi.updateConfig(editConfig.id, formData);
      } else {
        await sensitiveConfigApi.createConfig(formData);
      }
      setShowModal(false);
      setEditConfig(null);
      setFormData({ key: '', value: '', description: '' });
      fetchConfigs();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (config: SensitiveConfig) => {
    setEditConfig(config);
    setFormData({
      key: config.key,
      value: '',
      description: config.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this config?')) return;
    try {
      await sensitiveConfigApi.deleteConfig(id);
      fetchConfigs();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Delete failed');
    }
  };

  const openNewModal = () => {
    setEditConfig(null);
    setFormData({ key: '', value: '', description: '' });
    setShowModal(true);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Sensitive Configs</h1>
        <div className="page-actions">
          <Button variant="primary" onClick={openNewModal}>
            + Add Config
          </Button>
        </div>
      </div>

      <p className="text-secondary" style={{ marginBottom: '24px' }}>
        Store sensitive information securely. Use <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>{'${key}'}</code> in your configuration files to reference these values.
      </p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : configs.length === 0 ? (
          <div className="empty-state">
            <p>No sensitive configs yet. Click "Add Config" to create one.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((config) => (
                  <tr key={config.id}>
                    <td>
                      <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>
                        {config.key}
                      </code>
                    </td>
                    <td>{config.description || '-'}</td>
                    <td>{new Date(config.created_at).toLocaleDateString()}</td>
                    <td>{new Date(config.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        <Button variant="secondary" size="small" onClick={() => handleEdit(config)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="small" onClick={() => handleDelete(config.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`modal-overlay ${showModal ? '' : 'hidden'}`} onClick={() => setShowModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">{editConfig ? 'Edit Config' : 'New Config'}</h3>
            <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Key</label>
              <Input
                value={formData.key}
                onChange={(val) => setFormData({ ...formData, key: val })}
                placeholder="e.g., my_email"
                disabled={!!editConfig}
              />
            </div>
            <div className="form-group">
              <label>Value</label>
              <Input
                value={formData.value}
                onChange={(val) => setFormData({ ...formData, value: val })}
                placeholder={editConfig ? '(Leave empty to keep current)' : 'The secret value'}
                type="password"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <Input
                value={formData.description || ''}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder="What is this config for?"
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensitiveConfigs;