import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { Button, Input } from '../components/ui';

type AuthMode = 'login' | 'register' | 'forgot';

function Login() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const clearAllFields = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const toggleMode = (newMode: AuthMode) => {
    clearAllFields();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('两次输入的密码不一致');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('密码长度至少为6位');
          setLoading(false);
          return;
        }
        // 注册不需要 email 字段
        await authApi.register({ username, email: email || `${username}@example.com`, password });
        // 注册成功后自动登录
        const { data } = await authApi.login({ username, password });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        navigate('/');
      } else if (mode === 'forgot') {
        // 重置密码 - 直接设置新密码（Demo模式）
        // TODO: 实际应该调用 reset-password API
        setError('重置密码功能开发中，请联系管理员');
        setLoading(false);
        return;
      } else {
        const { data } = await authApi.login({ username, password });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || (mode === 'login' ? '登录失败，请检查用户名和密码' : '注册失败，请稍后重试'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-gradient" />
        <div className="login-bg-gradient login-bg-gradient-2" />
        <div className="login-bg-gradient login-bg-gradient-3" />
      </div>
      
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#3b82f6"/>
              <path d="M7 12L10 15L17 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>
            {mode === 'login' ? '欢迎回来' : mode === 'register' ? '创建账户' : '重置密码'}
          </h2>
          <p className="login-subtitle">
            {mode === 'login' ? '登录以继续学习' : mode === 'register' ? '注册开始您的学习之旅' : '输入新密码'}
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px', animation: 'shake 0.5s ease' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <Input
              label="邮箱（选填）"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="可不填写"
            />
          )}
          
          {(mode === 'login' || mode === 'register') && (
            <Input
              label="用户名"
              value={username}
              onChange={setUsername}
              placeholder="请输入用户名"
              required
            />
          )}

          {mode === 'forgot' ? (
            <Input
              label="新密码"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="输入新密码（至少6位）"
              required
            />
          ) : (
            <Input
              label="密码"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={mode === 'register' ? '至少6位字符' : '请输入密码'}
              required
            />
          )}
          
          {mode === 'register' && (
            <Input
              label="确认密码"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="请再次输入密码"
              required
            />
          )}

          {/* Remember me & Forgot Password */}
          {mode === 'login' && (
            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>记住我</span>
              </label>
              <button
                type="button"
                className="login-forgot"
                onClick={() => toggleMode('forgot')}
              >
                忘记密码?
              </button>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading 
              ? (mode === 'login' ? '登录中...' : mode === 'register' ? '注册中...' : '重置中...') 
              : (mode === 'login' ? '登录' : mode === 'register' ? '注册' : '重置密码')}
          </Button>
        </form>

        {/* Toggle Login/Register */}
        <div className="login-toggle">
          {mode === 'login' && (
            <>
              <span>还没有账户?</span>
              <button type="button" onClick={() => toggleMode('register')}>
                立即注册
              </button>
            </>
          )}
          {mode === 'register' && (
            <>
              <span>已有账户?</span>
              <button type="button" onClick={() => toggleMode('login')}>
                立即登录
              </button>
            </>
          )}
          {mode === 'forgot' && (
            <>
              <span>想起密码了?</span>
              <button type="button" onClick={() => toggleMode('login')}>
                返回登录
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

export default Login;