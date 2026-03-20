import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import './JobDetail.css';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function JobDetail() {
  const { jobId } = useParams();
  const { isCandidate, isAdmin, isCompany } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/jobs/${jobId}`).then(({ data }) => setJob(data)).catch(() => setJob(null)).finally(() => setLoading(false));
  }, [jobId]);

  const showApply = (isCandidate() || isAdmin()) && !isCompany();

  if (loading) return <div className="container py-5 text-center"><span className="spinner-border text-primary" /></div>;
  if (!job) return <div className="container py-5"><p className="text-muted">Job not found.</p></div>;

  return (
    <div className="container py-5 job-detail-page">
      <div className="card card-custom page-card mx-auto p-4 shadow-sm">
        <h2 className="mb-3">{job.title}</h2>
        <p className="text-muted mb-1"><strong>Company:</strong> {job.companyName}</p>
        <p className="text-muted mb-1"><strong>Location:</strong> {job.location}</p>
        <p className="text-muted mb-1"><strong>Salary:</strong> {job.salary}</p>
        <p className="text-muted mb-3"><strong>Posted:</strong> {formatDate(job.postedOn)}</p>
        <div className="mb-3"><strong>Description</strong><p className="mb-0">{job.description}</p></div>
        {showApply && <Link className="btn btn-primary btn-primary-custom" to={`/apply/${job.id}`}>Apply Now</Link>}
      </div>
    </div>
  );
}
