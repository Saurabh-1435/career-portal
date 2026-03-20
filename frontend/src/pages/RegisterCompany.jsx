import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { showSuccess, showError } from '../utils/notifications';
import './RegisterCompany.css';

const SIZE_OPTIONS = ['1-50', '51-200', '201-500', '500+'];
const TYPE_OPTIONS = ['Private', 'Public'];

export default function RegisterCompany() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    companyName: '',
    industry: '',
    companySize: '1-50',
    headquarters: '',
    companyType: 'Private',
    founded: new Date().getFullYear(),
    specialities: '',
    address: '',
    companyPhone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'founded' ? +value : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirmation) {
      showError('Passwords do not match.');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password)) {
      showError('Password: min 8 chars, upper, lower, number, special.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/company', form);
      login(data);
      showSuccess('Company registration successful! Welcome to our platform.');
      navigate('/company/profile', { replace: true });
    } catch (err) {
      showError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 register-company-page">
      <div className="card card-custom page-card mx-auto p-4 shadow-sm">
        <h2 className="text-center mb-4">Register as Company</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username *</label>
            <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email *</label>
            <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password *</label>
            <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
            <small className="text-muted">Min 8 chars, upper, lower, number, special.</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Password Confirmation *</label>
            <input type="password" className="form-control" name="passwordConfirmation" value={form.passwordConfirmation} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Company Name *</label>
            <input type="text" className="form-control" name="companyName" value={form.companyName} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Industry *</label>
            <input type="text" className="form-control" name="industry" value={form.industry} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Company Size *</label>
            <select className="form-select" name="companySize" value={form.companySize} onChange={handleChange}>
              {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Headquarters *</label>
            <input type="text" className="form-control" name="headquarters" value={form.headquarters} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Company Type *</label>
            <select className="form-select" name="companyType" value={form.companyType} onChange={handleChange}>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Founded *</label>
            <input type="number" className="form-control" name="founded" value={form.founded} onChange={handleChange} min={1800} max={2100} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Specialities</label>
            <textarea className="form-control" name="specialities" value={form.specialities} onChange={handleChange} rows={2} />
          </div>
          <div className="mb-3">
            <label className="form-label">Address</label>
            <input type="text" className="form-control" name="address" value={form.address} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Company Phone</label>
            <input type="text" className="form-control" name="companyPhone" value={form.companyPhone} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary btn-primary-custom w-100" disabled={loading}>
            {loading ? 'Joining…' : 'Join / Register'}
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          Already have an account? <Link to="/login" className="text-decoration-none">Login</Link>
        </p>
      </div>
    </div>
  );
}
