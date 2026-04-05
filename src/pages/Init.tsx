import { useState } from 'react';
import { initApi } from '../api';
import { Button, Card, Input, Alert } from '../components/ui';

function Init() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const handleInit = async (action: 'tables' | 'data' | 'all' | 'drop') => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      let res;
      switch (action) {
        case 'tables':
          res = await initApi.createTables();
          setMessage(res.data.message);
          break;
        case 'data':
          res = await initApi.initData(adminUsername, adminPassword);
          setMessage(res.data.message + (res.data.admin_exists ? '' : `, 管理员: ${res.data.admin_username}`));
          break;
        case 'all':
          res = await initApi.initAll(adminUsername, adminPassword);
          setMessage(res.data.message + (res.data.admin_exists ? '' : `, 管理员: ${res.data.admin_username}`));
          break;
        case 'drop':
          res = await initApi.dropTables();
          setMessage(res.data.message);
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>系统初始化</h1>
      </div>

      {message && (
        <Alert variant="success" onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card title="初始化设置">
        <div className="form-row">
          <Input
            label="管理员用户名"
            value={adminUsername}
            onChange={setAdminUsername}
            placeholder="默认: admin"
          />
          <Input
            label="管理员密码"
            type="password"
            value={adminPassword}
            onChange={setAdminPassword}
            placeholder="默认: admin123"
          />
        </div>

        <div className="flex gap-md" style={{ marginTop: '24px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={() => handleInit('all')}
            disabled={loading}
          >
            {loading ? '处理中...' : '完整初始化'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleInit('tables')}
            disabled={loading}
          >
            创建表
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleInit('data')}
            disabled={loading}
          >
            初始化数据
          </Button>
          <Button
            variant="danger"
            onClick={() => handleInit('drop')}
            disabled={loading}
          >
            删除所有表
          </Button>
        </div>
      </Card>

      <Card title="说明">
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#45515e' }}>
          <li><strong>完整初始化：</strong>创建所有表并初始化数据（角色、权限、管理员用户）</li>
          <li><strong>创建表：</strong>仅创建数据库表结构</li>
          <li><strong>初始化数据：</strong>创建默认角色、权限和管理员用户</li>
          <li><strong>删除所有表：</strong>删除所有数据库表（数据将丢失）</li>
        </ul>
        <p style={{ marginTop: '16px', color: '#8e8e93', fontSize: '14px' }}>
          默认管理员账号：admin / admin123
        </p>
      </Card>
    </div>
  );
}

export default Init;
