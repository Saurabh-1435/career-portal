import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { showSuccess, showError } from '../utils/notifications';
import './Login.css';

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { usernameOrEmail, password, rememberMe: remember });
      login(data);
      showSuccess('Login successful! Welcome back.');
      navigate(from, { replace: true });
    } catch (err) {
      showError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username or Email *</label>
            <input
              type="text"
              className="form-control"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="remember">Remember me</label>
          </div>
          <button type="submit" className="btn btn-primary btn-primary-custom w-100" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <div className="login-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <br />
          <span style={{ color: '#6b7280' }}>Don&apos;t have an account? </span>
          <Link to="/role">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
