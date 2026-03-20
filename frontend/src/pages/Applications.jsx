import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { showError } from '../utils/notifications';
import './Applications.css';

export default function Applications() {
  const { jobId } = useParams();
  const [jobTitle, setJobTitle] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const invalid = !jobId || isNaN(Number(jobId));
  const shownInvalidRef = useRef(false);

  useEffect(() => {
    if (invalid) {
      if (!shownInvalidRef.current) {
        shownInvalidRef.current = true;
        showError('Invalid job ID');
      }
      return;
    }
    shownInvalidRef.current = false;
  }, [invalid, jobId]);

  useEffect(() => {
    if (invalid) return;

    queueMicrotask(() => setLoading(true));
    api.get(`/jobs/${jobId}`)
      .then(({ data }) => setJobTitle(data?.title || 'Job'))
      .catch((error) => {
        console.error('Failed to load job details:', error);
        const errMsg = error.response?.data?.error ?? error.response?.data?.message ?? 'Failed to load job details';
        if (error.response?.status === 403) setJobTitle('Job (Access Restricted)');
        else if (error.response?.status === 404) setJobTitle('Job Not Found');
        else {
          setJobTitle('Job');
          console.warn('Job details error:', errMsg);
        }
      });

    api.get(`/applications/job/${jobId}`)
      .then(({ data }) => setApps(data || []))
      .catch((error) => {
        console.error('Failed to load applications:', error);
        if (error.response?.status === 403) showError('You are not authorized to view applications for this job.');
        else if (error.response?.status === 404) showError('Job not found.');
        else showError('Unable to load applications. Please try again.');
        setApps([]);
      })
      .finally(() => setLoading(false));
  }, [jobId, invalid]);

  const downloadResume = (appId, name) => {
    api.get(`/applications/${appId}/resume`, { responseType: 'blob' })
      .then(({ data }) => {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = name || 'resume.pdf';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error('Download error:', err);
        showError('Failed to download resume. Please try again.');
      });
  };

  const displayTitle = invalid ? 'Invalid Job' : jobTitle;
  const displayApps = invalid ? [] : apps;
  const displayLoading = invalid ? false : loading;

  if (displayLoading) return <div className="container py-5 text-center"><span className="spinner-border text-primary" /></div>;

  return (
    <div className="container py-5 applications-page">
      <h2 className="mb-4 page-title">Applications for {displayTitle}</h2>
      <div className="row g-3">
        {displayApps.map((a) => (
          <div key={a.id} className="col-12 col-md-6 col-lg-4">
            <div className="card card-custom application-card h-100">
              <div className="card-body">
                <h6 className="card-title">{a.candidateName}</h6>
                <p className="card-text text-muted small mb-2">{a.candidateEmail}</p>
                {a.hasResume && (
                  <button type="button" className="btn btn-sm btn-primary btn-primary-custom" onClick={() => downloadResume(a.id, a.resumeFileName)}>
                    Download Resume
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!displayApps.length && <p className="text-muted">No applications yet.</p>}
    </div>
  );
}
