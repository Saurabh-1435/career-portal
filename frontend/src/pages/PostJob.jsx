import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { showSuccess, showError } from '../utils/notifications';
import './PostJob.css';

export default function PostJob() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', location: '', salary: '', category: '' });
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const categoryOptions = [
    'Technology',
    'Design',
    'Marketing',
    'Sales',
    'Finance',
    'Human Resources',
    'Operations',
    'Customer Service',
    'Engineering',
    'Healthcare',
    'Education',
    'Legal',
    'Consulting',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Media',
    'Research',
    'Other'
  ];

  useEffect(() => {
    if (editId) {
      api.get(`/jobs/${editId}`).then(({ data }) => {
        setForm({
          title: data.title,
          description: data.description,
          location: data.location,
          salary: String(data.salary),
          category: data.category || '',
        });
        setCompanyId(String(data.companyId));
      }).catch(() => showError('Job not found or access denied.'));
    }
  }, [editId]);

  useEffect(() => {
    if (isAdmin()) {
      api.get('/admin/companies')
        .then(({ data }) => setCompanies(data))
        .catch(() => setCompanies([]));
    }
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdmin() && !editId && !companyId) {
      showError('Select a company when posting as admin.');
      return;
    }
    setLoading(true);
    const payload = { ...form, salary: parseFloat(form.salary) };
    if (isAdmin() && companyId) payload.companyId = parseInt(companyId, 10);
    try {
      if (editId) {
        await api.put(`/jobs/${editId}`, payload);
        showSuccess('Job updated successfully! Redirecting to dashboard...');
      } else {
        await api.post('/jobs', payload);
        showSuccess('Job posted successfully! You can now see this job in your dashboard.');
      }
      setTimeout(() => navigate('/company/dashboard'), 1500);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 post-job-page">
      <div className="card card-custom page-card mx-auto p-4 shadow-sm">
        <h2 className="mb-4">{editId ? 'Edit Job' : 'Post a New Job'}</h2>
        <form onSubmit={handleSubmit}>
          {isAdmin() && companies.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Company</label>
              <select className="form-select" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">Select company</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
          )}
          <div className="mb-3">
            <label className="form-label">Title *</label>
            <input type="text" className="form-control" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Description *</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={4} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Location *</label>
            <input type="text" className="form-control" name="location" value={form.location} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Category *</label>
            <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Salary *</label>
            <input type="number" className="form-control" name="salary" value={form.salary} onChange={handleChange} step="0.01" required />
          </div>
          <button type="submit" className="btn btn-success btn-success-custom w-100" disabled={loading}>
            {loading ? 'Saving…' : editId ? 'Update Job' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}
