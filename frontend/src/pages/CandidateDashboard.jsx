import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { showSuccess, showError } from '../utils/notifications';
import './CandidateDashboard.css';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
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

  const statusDescriptions = {
    'APPLIED': 'Your application has been submitted',
    'SHORTLISTED': 'Congratulations! You have been shortlisted',
    'INTERVIEW_SCHEDULED': 'Interview has been scheduled',
    'SELECTED': 'Congratulations! You have been selected',
    'REJECTED': 'Unfortunately, your application was not selected'
  };

  return (
    <span
      className={`badge ${statusClasses[status] || 'bg-secondary'}`}
      title={statusDescriptions[status] || status}
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

export default function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds if enabled
    const interval = autoRefresh ? setInterval(fetchDashboardData, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, statsRes] = await Promise.all([
        api.get('/applications/candidate').catch((err) => {
          console.error('Failed to load applications:', err);
          return { data: [] };
        }),
        api.get('/applications/candidate/stats').catch((err) => {
          console.error('Failed to load stats:', err);
          return { 
            data: {
              totalApplications: 0,
              appliedApplications: 0,
              shortlistedApplications: 0,
              interviewScheduledApplications: 0,
              selectedApplications: 0,
              rejectedApplications: 0
            }
          };
        })
      ]);

      setApplications(applicationsRes.data || []);
      setStats(statsRes.data || {
        totalApplications: 0,
        appliedApplications: 0,
        shortlistedApplications: 0,
        interviewScheduledApplications: 0,
        selectedApplications: 0,
        rejectedApplications: 0
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setApplications([]);
      setStats({
        totalApplications: 0,
        appliedApplications: 0,
        shortlistedApplications: 0,
        interviewScheduledApplications: 0,
        selectedApplications: 0,
        rejectedApplications: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for "${jobTitle}"?`)) {
      return;
    }

    try {
      await api.put(`/applications/${applicationId}/withdraw`);
      showSuccess('Application withdrawn successfully.');

      // Update the application status locally
      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, status: 'REJECTED' } : app
      ));

      // Refresh stats
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      showError('Failed to withdraw application. Please try again.');
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <span className="spinner-border text-primary" />
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container py-5 candidate-dashboard">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">My Dashboard</h2>
            <div className="d-flex align-items-center gap-3">
              {lastUpdated && (
                <small className="text-muted">
                  Last updated: {formatDate(lastUpdated)}
                </small>
              )}
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={toggleAutoRefresh}
                />
                <label className="form-check-label" htmlFor="autoRefresh">
                  Auto-refresh
                </label>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="card card-custom text-center">
              <div className="card-body">
                <h5 className="card-title text-primary">{stats.totalApplications || 0}</h5>
                <p className="card-text">Total Applications</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card card-custom text-center">
              <div className="card-body">
                <h5 className="card-title text-info">{stats.appliedApplications || 0}</h5>
                <p className="card-text">Applied</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card card-custom text-center">
              <div className="card-body">
                <h5 className="card-title text-primary">{stats.shortlistedApplications || 0}</h5>
                <p className="card-text">Shortlisted</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card card-custom text-center">
              <div className="card-body">
                <h5 className="card-title text-secondary">{stats.interviewScheduledApplications || 0}</h5>
                <p className="card-text">Interview Scheduled</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card card-custom text-center">
              <div className="card-body">
                <h5 className="card-title text-success">{stats.selectedApplications || 0}</h5>
                <p className="card-text">Selected</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card card-custom text-center">
              <div className="card-body">
                <h5 className="card-title text-danger">{stats.rejectedApplications || 0}</h5>
                <p className="card-text">Rejected</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="card card-custom">
        <div className="card-header">
          <h5 className="mb-0">My Job Applications</h5>
        </div>
        <div className="card-body">
          {!applications.length ? (
            <div className="text-center py-4">
              <svg width="64" height="64" fill="currentColor" className="text-muted mb-3" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M5 6.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm1.138-1.496a.75.75 0 1 0-.975 1.14L6.28 8.53a.75.75 0 0 0 1.25-.833l-1.17-1.867zm3.724 1.867a.75.75 0 0 0-1.25.833l1.17 1.867a.75.75 0 0 0 .975-1.14l-.895-.716z"/>
              </svg>
              <h6 className="text-muted">No applications yet</h6>
              <p className="text-muted">Start applying to jobs to see your applications here.</p>
              <Link to="/jobs" className="btn btn-primary btn-primary-custom">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.jobTitle}</strong>
                      </td>
                      <td>{app.companyName}</td>
                      <td>{app.jobLocation}</td>
                      <td>{formatDate(app.appliedAt)}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link
                            to={`/job/${app.jobId}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View Job
                          </Link>
                          {!['SELECTED', 'REJECTED'].includes(app.status) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => withdrawApplication(app.id, app.jobTitle)}
                              title="Withdraw your application"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Application Status Overview */}
      {applications.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card card-custom">
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
          </div>
        </div>
      )}

      {/* Recent Activity Timeline */}
      {applications.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card card-custom">
              <div className="card-header">
                <h6 className="mb-0">Recent Activity</h6>
              </div>
              <div className="card-body">
                <div className="timeline">
                  {applications.slice(0, 8).map((app) => (
                    <div key={app.id} className="timeline-item mb-3">
                      <div className="timeline-marker bg-primary">
                        {getStatusTimelineIcon(app.status)}
                      </div>
                      <div className="timeline-content">
                        <small className="text-muted">{formatDate(app.appliedAt)}</small>
                        <p className="mb-1">
                          Applied to <strong>{app.jobTitle}</strong> at <strong>{app.companyName}</strong>
                          <br />
                          <small className="text-muted">📍 {app.jobLocation}</small>
                        </p>
                        <div className="d-flex align-items-center gap-2">
                          {getStatusBadge(app.status)}
                          {!['SELECTED', 'REJECTED'].includes(app.status) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() => withdrawApplication(app.id, app.jobTitle)}
                              title="Withdraw application"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {applications.length > 8 && (
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Showing 8 most recent applications. View all in the table above.
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}