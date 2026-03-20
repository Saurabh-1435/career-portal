import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { showSuccess, showError } from '../utils/notifications';
import './ApplyJob.css';

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${jobId}`)
      .then(({ data }) => setTitle(data.title))
      .catch((err) => {
        console.error('Failed to load job details:', err);
        setTitle('Job');
      });
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume?.length) {
      showError('Please choose a resume file.');
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append('resume', resume[0]);
    try {
      await api.post(`/applications/job/${jobId}`, fd);
      showSuccess('Application submitted successfully! Redirecting to jobs page...');
      setTimeout(() => navigate('/jobs'), 2000);
    } catch (err) {
      console.error('Application submission error:', err);
      const errorMessage = err.response?.data?.error ||
                          err.response?.data?.message ||
                          'Application failed. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 apply-job-page">
      <div className="card card-custom page-card mx-auto p-4 shadow-sm">
        <h2 className="mb-4">Apply for {title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Resume *</label>
            <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files)} />
            <small className="text-muted">{resume?.length ? resume[0].name : 'No file chosen'}</small>
          </div>
          <button type="submit" className="btn btn-success btn-success-custom w-100" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
