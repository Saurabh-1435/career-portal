import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { showSuccess, showError } from '../utils/notifications';
import './CompanyDashboard.css';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
}

function getStatusText(status) {
  const statusText = {
    'APPLIED': 'Applied',
    'SHORTLISTED': 'Shortlisted',
    'INTERVIEW_SCHEDULED': 'Interview Scheduled',
    'SELECTED': 'Selected',
    'REJECTED': 'Rejected'
  };
  return statusText[status] || status;
}

function getStatusBadge(status) {
  const statusClasses = {
    'APPLIED': 'bg-info text-white',
    'SHORTLISTED': 'bg-primary text-white',
    'INTERVIEW_SCHEDULED': 'bg-secondary text-white',
    'SELECTED': 'bg-success text-white',
    'REJECTED': 'bg-danger text-white'
  };

  const statusText = {
    'APPLIED': 'Applied',
    'SHORTLISTED': 'Shortlisted',
    'INTERVIEW_SCHEDULED': 'Interview Scheduled',
    'SELECTED': 'Selected',
    'REJECTED': 'Rejected'
  };

  return (
    <span
      className={`badge ${statusClasses[status] || 'bg-secondary'}`}
      title={`Status: ${statusText[status] || status}`}
    >
      {statusText[status] || status}
    </span>
  );
}

function getStatusTimelineIcon(status) {
  const icons = {
    'APPLIED': '📨',
    'SHORTLISTED': '⭐',
    'INTERVIEW_SCHEDULED': '🎤',
    'SELECTED': '✅',
    'REJECTED': '❌'
  };
  return icons[status] || '❓';
}

function canUpdateStatus(currentStatus) {
  // Cannot update status for terminal states
  return !['SELECTED', 'REJECTED'].includes(currentStatus);
}

export default function CompanyDashboard() {
  const { isCompany, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [companyRes, jobsRes, applicationsRes] = await Promise.all([
        api.get('/companies/me').catch((err) => {
          console.error('Failed to load company:', err);
          return { data: null };
        }),
        api.get('/jobs').catch((err) => {
          console.error('Failed to load jobs:', err);
          return { data: [] };
        }),
        api.get('/applications/company').catch((err) => {
          console.error('Failed to load applications:', err);
          return { data: [] };
        })
      ]);

      setCompany(companyRes.data);
      setJobs(jobsRes.data);
      setApplications(applicationsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setCompany(null);
      setJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && company === null && !isAdmin() && !isCompany()) {
      navigate('/access-denied');
    }
  }, [loading, company, isAdmin, isCompany, navigate]);

  const myJobs = jobs.filter((j) => (company && j.companyId === company.id) || isAdmin());

  // Filter applications by status
  const filteredApplications = applications.filter(app =>
    statusFilter === 'all' || app.status === statusFilter
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      showSuccess('Job deleted successfully.');
    } catch (err) {
      console.error('Failed to delete job:', err);
      showError('Failed to delete job. Please try again.');
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    const statusMessages = {
      'SHORTLISTED': 'shortlist this candidate',
      'INTERVIEW_SCHEDULED': 'schedule an interview',
      'SELECTED': 'select this candidate',
      'REJECTED': 'reject this application'
    };

    if (!window.confirm(`Are you sure you want to ${statusMessages[newStatus]}?`)) {
      return;
    }

    try {
      const { data } = await api.put(`/applications/${applicationId}/status`, { status: newStatus });
      setApplications(prev => prev.map(app =>
        app.id === applicationId ? data : app
      ));
      showSuccess(`Application status updated to ${getStatusText(newStatus)}`);
    } catch (err) {
      console.error('Failed to update application status:', err);
      showError(err.response?.data?.error || 'Failed to update application status. Please try again.');
    }
  };

  const downloadResume = (appId) => {
    api.get(`/applications/${appId}/resume`)
      .then(({ data }) => {
        // Open Cloudinary URL in new tab for download
        if (data.url) {
          window.open(data.url, '_blank');
        } else {
          showError('Resume URL not found.');
        }
      })
      .catch((err) => {
        console.error('Download error:', err);
        showError('Failed to download resume. Please try again.');
      });
  };

  if (loading) return <div className="container py-5 text-center"><span className="spinner-border text-primary" /></div>;
  if (!loading && !company && !isAdmin() && !isCompany()) return null;
  
  return (
    <div className="container py-5 company-dashboard">
      <h2 className="mb-4 dashboard-header">Company Dashboard</h2>
      
      {/* Show warning if company user but no profile exists yet */}
      {!loading && !company && isCompany() && !isAdmin() && (
        <div className="alert alert-warning mb-4">
          <h5 className="alert-heading">Complete Your Company Profile</h5>
          <p className="mb-2">Your company profile is not set up yet. Please complete your profile to get the most out of the dashboard.</p>
          <Link className="btn btn-primary btn-primary-custom" to="/company/profile">Go to Company Profile</Link>
        </div>
      )}
      
      {company && (
        <div className="card card-custom mb-4 p-4">
          <h5>{company.companyName}</h5>
          <p className="text-muted mb-0">{company.email} · {company.companyPhone || '-'} · {company.address || '-'} · {company.industry}</p>
        </div>
      )}
      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs ({jobs.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications ({applications.length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'jobs' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Posted Jobs</h5>
            <Link className="btn btn-primary btn-primary-custom" to="/post-job">Post New Job</Link>
          </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Posted On</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myJobs.map((j) => (
              <tr key={j.id}>
                <td>{j.title}</td>
                <td>{j.location}</td>
                <td>{formatDate(j.postedOn)}</td>
                <td>
                  <span className="me-2">{j.applicationCount || 0}</span>
                  <Link className="btn btn-sm btn-warning text-dark" to={`/applications/${j.id}`}>View</Link>
                </td>
                <td>
                  <Link className="btn btn-sm btn-warning text-dark me-1" to={`/post-job?edit=${j.id}`}>Edit</Link>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(j.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!myJobs.length && <p className="text-muted">No jobs posted yet.</p>}
      </>
      )}

      {activeTab === 'applications' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">Application Management</h5>
              <small className="text-muted">
                Showing {filteredApplications.length} of {applications.length} applications
              </small>
            </div>
            <button
              className="btn btn-outline-primary"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Status Filter */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="statusFilter" className="form-label fw-bold">Filter by Status:</label>
              <select
                id="statusFilter"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="APPLIED">Applied</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {!filteredApplications.length ? (
            <div className="text-center py-4">
              <svg width="64" height="64" fill="currentColor" className="text-muted mb-3" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M5 6.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm1.138-1.496a.75.75 0 1 0-.975 1.14L6.28 8.53a.75.75 0 0 0 1.25-.833l-1.17-1.867zm3.724 1.867a.75.75 0 0 0-1.25.833l1.17 1.867a.75.75 0 0 0 .975-1.14l-.895-.716z"/>
              </svg>
              <h6 className="text-muted">
                {statusFilter === 'all'
                  ? 'No applications received yet'
                  : `No applications with status "${getStatusText(statusFilter)}"`}
              </h6>
              <p className="text-muted">
                {statusFilter === 'all'
                  ? 'Applications will appear here once candidates apply to your jobs.'
                  : 'Try selecting a different status filter or check back later.'}
              </p>
            </div>
          ) : (
            <>
              {/* Application Status Overview */}
              {statusFilter === 'all' && (
                <div className="card card-custom mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Application Status Overview</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'].map(status => {
                        const count = applications.filter(app => app.status === status).length;
                        if (count === 0) return null;

                        return (
                          <div key={status} className="col-md-3 col-sm-6">
                            <div className="text-center">
                              <div className="mb-2">{getStatusTimelineIcon(status)}</div>
                              <h5 className="mb-1">{count}</h5>
                              <small className="text-muted">{getStatusText(status)}</small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job Title</th>
                    <th>Location</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div>
                          <strong>{app.candidateName}</strong>
                          <br />
                          <small className="text-muted">{app.candidateEmail}</small>
                        </div>
                      </td>
                      <td>{app.jobTitle}</td>
                      <td>{app.jobLocation}</td>
                      <td>{formatDate(app.appliedAt)}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {app.hasResume && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => downloadResume(app.id)}
                              title="Download Resume"
                            >
                              Resume
                            </button>
                          )}
                          {canUpdateStatus(app.status) && (
                            <>
                              {app.status === 'APPLIED' && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => updateApplicationStatus(app.id, 'SHORTLISTED')}
                                    title="Shortlist this candidate"
                                  >
                                    Shortlist
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                                    title="Reject this application"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {app.status === 'SHORTLISTED' && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => updateApplicationStatus(app.id, 'INTERVIEW_SCHEDULED')}
                                    title="Schedule interview"
                                  >
                                    Schedule Interview
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                                    title="Reject this application"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {app.status === 'INTERVIEW_SCHEDULED' && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-success"
                                    onClick={() => updateApplicationStatus(app.id, 'SELECTED')}
                                    title="Select this candidate"
                                  >
                                    Select
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                                    title="Reject this application"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
