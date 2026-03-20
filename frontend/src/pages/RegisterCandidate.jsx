import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { showSuccess, showError } from '../utils/notifications';
import './RegisterCandidate.css';

const STATUS_OPTIONS = ['Fresher', 'Experienced'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export default function RegisterCandidate() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    name: '',
    mobile: '',
    status: 'Fresher',
    gender: 'Male',
    dob: '',
    education: '',
    skills: '',
  });
  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
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
    if (!resume || !resume.length) {
      showError('Resume is required.');
      return;
    }
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('resume', resume[0]);
    if (photo?.length) fd.append('photo', photo[0]);
    try {
      const { data } = await api.post('/auth/register/candidate', fd);
      login(data);
      showSuccess('Registration successful! Welcome to our platform.');
      navigate('/profile', { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.error ||
                          err.response?.data?.message ||
                          (err.response?.data && typeof err.response.data === 'string' ? err.response.data : null) ||
                          'Registration failed. Please check all fields and try again.';
      showError(errorMessage);
      console.error('Registration error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register as Candidate</h2>
        <form className="register-form" onSubmit={handleSubmit}>
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
            <label className="form-label">Name *</label>
            <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Mobile *</label>
            <input type="text" className="form-control" name="mobile" value={form.mobile} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Status *</label>
            <select className="form-select" name="status" value={form.status} onChange={handleChange}>
              <option value="Fresher">Fresher</option>
              <option value="Experienced">Experienced</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Gender *</label>
            <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
              {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">DOB *</label>
            <input type="date" className="form-control" name="dob" value={form.dob} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Education *</label>
            <textarea className="form-control" name="education" value={form.education} onChange={handleChange} rows={2} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Skills</label>
            <textarea className="form-control" name="skills" value={form.skills} onChange={handleChange} rows={2} />
          </div>
          <div className="mb-3">
            <label className="form-label">Resume *</label>
            <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files)} />
            <small className="text-muted">{resume?.length ? resume[0].name : 'No file chosen'}</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Photo</label>
            <input type="file" className="form-control" accept="image/*" onChange={(e) => setPhoto(e.target.files)} />
            <small className="text-muted">{photo?.length ? photo[0].name : 'No file chosen'}</small>
          </div>
          <button type="submit" className="btn btn-primary btn-primary-custom w-100" disabled={loading}>
            {loading ? 'Joining…' : 'Join / Register'}
          </button>
        </form>
        <div className="register-links">
          <span style={{ color: '#6b7280' }}>Already have an account? </span>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
