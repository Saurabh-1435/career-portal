import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { showSuccess, showError } from '../utils/notifications';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', null, { params: { email } });
      showSuccess('Password reset email sent! Check your inbox for instructions.');
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 forgot-password-page">
      <div className="card card-custom page-card mx-auto p-4 shadow-sm">
        <h2 className="text-center mb-4">Forgot Password</h2>
        <p className="text-center text-muted mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-primary-custom w-100" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          <Link to="/login" className="text-decoration-none">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}