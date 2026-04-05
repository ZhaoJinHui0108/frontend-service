import { useState } from 'react';
import { initApi } from '../api';

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
    <div>
      <div className="page-header">
        <h1>系统初始化</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>初始化设置</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="form-group">
            <label>管理员用户名</label>
            <input
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>管理员密码</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => handleInit('all')} disabled={loading}>
            完整初始化
          </button>
          <button className="btn btn-secondary" onClick={() => handleInit('tables')} disabled={loading}>
            创建表
          </button>
          <button className="btn btn-secondary" onClick={() => handleInit('data')} disabled={loading}>
            初始化数据
          </button>
          <button className="btn btn-danger" onClick={() => handleInit('drop')} disabled={loading}>
            删除所有表
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>说明</h3>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: '#666' }}>
          <li><strong>完整初始化：</strong>创建所有表并初始化数据（角色、权限、管理员用户）</li>
          <li><strong>创建表：</strong>仅创建数据库表结构</li>
          <li><strong>初始化数据：</strong>创建默认角色、权限和管理员用户</li>
          <li><strong>删除所有表：</strong>删除所有数据库表（数据将丢失）</li>
        </ul>
        <p style={{ marginTop: 16, color: '#999' }}>
          默认管理员账号：admin / admin123
        </p>
      </div>
    </div>
  );
}

export default Init;