import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { showSuccess, showError } from '../utils/notifications';
import './AdminDashboard.css';
function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('overview');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [changingPassword, setChangingPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch((err) => {
        console.error('Failed to load dashboard stats:', err);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (active === 'candidates') {
      api.get('/admin/candidates')
        .then(({ data }) => setCandidates(data))
        .catch((err) => {
          console.error('Failed to load candidates:', err);
          setCandidates([]);
        });
    }
    if (active === 'companies') {
      api.get('/admin/companies')
        .then(({ data }) => setCompanies(data))
        .catch((err) => {
          console.error('Failed to load companies:', err);
          setCompanies([]);
        });
    }
    if (active === 'jobs') {
      api.get('/admin/jobs')
        .then(({ data }) => setJobs(data))
        .catch((err) => {
          console.error('Failed to load jobs:', err);
          setJobs([]);
        });
    }
    if (active === 'applications') {
      api.get('/admin/applications')
        .then(({ data }) => setApplications(data))
        .catch((err) => {
          console.error('Failed to load applications:', err);
          setApplications([]);
        });
    }
    if (active === 'users') {
      api.get('/admin/users')
        .then(({ data }) => setUsers(data))
        .catch((err) => {
          console.error('Failed to load users:', err);
          setUsers([]);
        });
    }
    if (active === 'analytics') {
      api.get('/admin/jobs')
        .then(({ data }) => setJobs(data))
        .catch((err) => {
          console.error('Failed to load analytics jobs:', err);
          setJobs([]);
        });
    }
  }, [active]);

  const deleteCandidate = (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    api.delete(`/admin/candidates/${id}`)
      .then(() => {
        setCandidates((p) => p.filter((c) => c.id !== id));
        showSuccess('Candidate deleted successfully.');
      })
      .catch((err) => {
        console.error('Failed to delete candidate:', err);
        showError('Failed to delete candidate. Please try again.');
      });
  };
  const deleteCompany = (id) => {
    if (!window.confirm('Delete this company?')) return;
    api.delete(`/admin/companies/${id}`)
      .then(() => {
        setCompanies((p) => p.filter((c) => c.id !== id));
        showSuccess('Company deleted successfully.');
      })
      .catch((err) => {
        console.error('Failed to delete company:', err);
        showError('Failed to delete company. Please try again.');
      });
  };

  const approveCompany = (id) => {
    if (!window.confirm('Approve this company registration?')) return;
    api.put(`/admin/companies/${id}/approve`)
      .then(({ data }) => {
        setCompanies((p) => p.map((c) => (c.id === id ? data : c)));
        showSuccess('Company approved successfully.');
      })
      .catch((err) => {
        console.error('Failed to approve company:', err);
        showError('Failed to approve company. Please try again.');
      });
  };

  const rejectCompany = (id) => {
    if (!window.confirm('Reject this company registration?')) return;
    api.put(`/admin/companies/${id}/reject`)
      .then(({ data }) => {
        setCompanies((p) => p.map((c) => (c.id === id ? data : c)));
        showSuccess('Company rejected successfully.');
      })
      .catch((err) => {
        console.error('Failed to reject company:', err);
        showError('Failed to reject company. Please try again.');
      });
  };
  const deleteJob = (id) => {
    if (!window.confirm('Delete this job?')) return;
    api.delete(`/admin/jobs/${id}`)
      .then(() => {
        setJobs((p) => p.filter((j) => j.id !== id));
        showSuccess('Job deleted successfully.');
      })
      .catch((err) => {
        console.error('Failed to delete job:', err);
        showError('Failed to delete job. Please try again.');
      });
  };

  const deleteUser = (id) => {
    if (!window.confirm('Delete this user? This will also delete their profile and all associated data.')) return;
    api.delete(`/admin/users/${id}`)
      .then(() => {
        setUsers((p) => p.filter((u) => u.id !== id));
        showSuccess('User deleted successfully.');
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          showError('Access denied. You need admin privileges to delete users.');
        } else if (err.response?.status === 404) {
          showError('User not found or already deleted.');
        } else {
          showError(err.response?.data?.error || 'Failed to delete user. Please try again.');
        }
      });
  };

  const handleEditRoles = (user) => {
    setEditingUser(user);
    setSelectedRoles([...user.roles]);
  };

  const handleSaveRoles = async (userId) => {
    if (selectedRoles.length === 0) {
      showError('At least one role must be selected.');
      return;
    }
    try {
      const { data } = await api.put(`/admin/users/${userId}/roles`, { roles: selectedRoles });
      setUsers((prev) => prev.map((u) => (u.id === userId ? data : u)));
      setEditingUser(null);
      showSuccess('User roles updated successfully.');
    } catch (err) {
      console.error('Failed to update roles:', err);
      showError(err.response?.data?.error || 'Failed to update roles. Please try again.');
    }
  };

  const handleChangePassword = (user) => {
    setChangingPassword(user);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePassword = async (userId) => {
    if (!newPassword.trim()) {
      showError('New password is required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showError('Password must be at least 8 characters with uppercase, lowercase, number and special character.');
      return;
    }

    try {
      await api.put(`/admin/users/${userId}/password`, { newPassword });
      setChangingPassword(null);
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Password changed successfully.');
    } catch (err) {
      console.error('Failed to change password:', err);
      showError(err.response?.data?.error || 'Failed to change password. Please try again.');
    }
  };

  const handleAdminPasswordChange = async () => {
    if (!adminCurrentPassword.trim()) {
      showError('Current password is required.');
      return;
    }

    if (!adminNewPassword.trim()) {
      showError('New password is required.');
      return;
    }

    if (adminNewPassword !== adminConfirmPassword) {
      showError('New passwords do not match.');
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(adminNewPassword)) {
      showError('Password must be at least 8 characters with uppercase, lowercase, number and special character.');
      return;
    }

    try {
      // For admin password change, we need to use the admin's own user ID (usually 1)
      // Since this is a demo, we'll use a simple approach
      await api.put('/admin/users/1/password', { newPassword: adminNewPassword });
      setAdminCurrentPassword('');
      setAdminNewPassword('');
      setAdminConfirmPassword('');
      showSuccess('Admin password changed successfully.');
    } catch (err) {
      console.error('Failed to change admin password:', err);
      showError(err.response?.data?.error || 'Failed to change admin password. Please try again.');
    }
  };

  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  if (loading) return <div className="container py-5 text-center"><span className="spinner-border text-primary" /></div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <h4 className="mb-0">Admin Panel</h4>
            <small className="text-muted">Management Console</small>
          </div>

          <div className="sidebar-nav">
            <div
              className={`sidebar-item ${active === 'overview' ? 'active' : ''}`}
              onClick={() => setActive('overview')}
            >
              <i className="fas fa-tachometer-alt me-2"></i>
              Overview
            </div>

            <div
              className={`sidebar-item ${active === 'candidates' ? 'active' : ''}`}
              onClick={() => setActive('candidates')}
            >
              <i className="fas fa-users me-2"></i>
              Candidates
            </div>

            <div
              className={`sidebar-item ${active === 'companies' ? 'active' : ''}`}
              onClick={() => setActive('companies')}
            >
              <i className="fas fa-building me-2"></i>
              Companies
            </div>

            <div
              className={`sidebar-item ${active === 'jobs' ? 'active' : ''}`}
              onClick={() => setActive('jobs')}
            >
              <i className="fas fa-briefcase me-2"></i>
              Jobs
            </div>

            <div
              className={`sidebar-item ${active === 'applications' ? 'active' : ''}`}
              onClick={() => setActive('applications')}
            >
              <i className="fas fa-file-alt me-2"></i>
              Applications
            </div>

            <div
              className={`sidebar-item ${active === 'users' ? 'active' : ''}`}
              onClick={() => setActive('users')}
            >
              <i className="fas fa-user-shield me-2"></i>
              User Roles
            </div>

            <div
              className={`sidebar-item ${active === 'analytics' ? 'active' : ''}`}
              onClick={() => setActive('analytics')}
            >
              <i className="fas fa-chart-bar me-2"></i>
              Analytics
            </div>

            <div className="sidebar-divider"></div>

            <div className="sidebar-item external-link">
              <Link to="/report/candidate" className="text-decoration-none text-white">
                <i className="fas fa-file-pdf me-2"></i>
                Candidate Report
              </Link>
            </div>

            <div className="sidebar-item external-link">
              <Link to="/report/company" className="text-decoration-none text-white">
                <i className="fas fa-file-pdf me-2"></i>
                Company Report
              </Link>
            </div>

            <div className="sidebar-item external-link">
              <Link to="/post-job" className="text-decoration-none text-white">
                <i className="fas fa-plus-circle me-2"></i>
                Post New Job
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-main">
          <div className="main-header">
            <h2 className="mb-1">Admin Dashboard</h2>
            <p className="text-muted mb-0">Manage users, companies, jobs, and applications</p>
          </div>

          <div className="main-content">
            {active === 'overview' && stats && (
        <>
          <div className="row g-3 mb-5">
            <div className="col-6 col-md-3">
              <div className="card card-custom">
                <div className="card-body">
                  <h5 className="card-title">Total Candidates</h5>
                  <p className="mb-0 fs-4 text-primary">{stats.totalCandidates}</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card card-custom">
                <div className="card-body">
                  <h5 className="card-title">Total Companies</h5>
                  <p className="mb-0 fs-4 text-success">{stats.totalCompanies}</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card card-custom">
                <div className="card-body">
                  <h5 className="card-title">Total Jobs</h5>
                  <p className="mb-0 fs-4 text-warning">{stats.totalJobs}</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card card-custom">
                <div className="card-body">
                  <h5 className="card-title">Total Applications</h5>
                  <p className="mb-0 fs-4 text-info">{stats.totalApplications}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Password Change Section */}
          <div className="card card-custom mb-5">
            <div className="card-header">
              <h5 className="mb-0">🔐 Change Admin Password</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter current password"
                    value={adminCurrentPassword}
                    onChange={(e) => setAdminCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm new password"
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-primary btn-primary-custom"
                  onClick={handleAdminPasswordChange}
                >
                  <i className="fas fa-key me-2"></i>Update Password
                </button>
                <small className="text-muted ms-2">
                  Password must be at least 8 characters with uppercase, lowercase, number and special character.
                </small>
              </div>
            </div>
          </div>
        </>
      )}

      {active === 'analytics' && stats && (
        <div className="analytics-dashboard">
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card card-custom analytics-stat">
                <div className="card-body">
                  <h6 className="text-muted text-uppercase mb-1">Candidates</h6>
                  <p className="mb-0 fs-4 fw-bold text-primary">{stats.totalCandidates}</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card card-custom analytics-stat">
                <div className="card-body">
                  <h6 className="text-muted text-uppercase mb-1">Companies</h6>
                  <p className="mb-0 fs-4 fw-bold text-success">{stats.totalCompanies}</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card card-custom analytics-stat">
                <div className="card-body">
                  <h6 className="text-muted text-uppercase mb-1">Jobs</h6>
                  <p className="mb-0 fs-4 fw-bold text-warning">{stats.totalJobs}</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card card-custom analytics-stat">
                <div className="card-body">
                  <h6 className="text-muted text-uppercase mb-1">Applications</h6>
                  <p className="mb-0 fs-4 fw-bold text-info">{stats.totalApplications}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card card-custom h-100">
                <div className="card-header">
                  <h5 className="mb-0">Top jobs by applications</h5>
                </div>
                <div className="card-body">
                  {jobs.length === 0 ? (
                    <p className="text-muted mb-0">Loading…</p>
                  ) : (
                    <div className="analytics-list">
                      {[...jobs]
                        .sort((a, b) => (b.applicationCount ?? 0) - (a.applicationCount ?? 0))
                        .slice(0, 8)
                        .map((j) => (
                          <div key={j.id} className="analytics-row">
                            <div className="analytics-row-label">
                              <span className="fw-medium">{j.title}</span>
                              <span className="text-muted small">{j.companyName}</span>
                            </div>
                            <div className="analytics-bar-wrap">
                              <div
                                className="analytics-bar"
                                style={{
                                  width: `${
                                    stats.totalApplications
                                      ? Math.min(100, ((j.applicationCount ?? 0) / stats.totalApplications) * 100)
                                      : 0
                                  }%`,
                                }}
                              />
                              <span className="analytics-value">{j.applicationCount ?? 0}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card card-custom h-100">
                <div className="card-header">
                  <h5 className="mb-0">Jobs per company</h5>
                </div>
                <div className="card-body">
                  {jobs.length === 0 ? (
                    <p className="text-muted mb-0">Loading…</p>
                  ) : (
                    (() => {
                      const byCompany = jobs.reduce((acc, j) => {
                        const n = j.companyName || 'Unknown';
                        acc[n] = (acc[n] ?? 0) + 1;
                        return acc;
                      }, {});
                      const entries = Object.entries(byCompany).sort((a, b) => b[1] - a[1]).slice(0, 8);
                      const max = Math.max(...entries.map(([, v]) => v), 1);
                      return (
                        <div className="analytics-list">
                          {entries.map(([company, count]) => (
                            <div key={company} className="analytics-row">
                              <div className="analytics-row-label">
                                <span className="fw-medium">{company}</span>
                              </div>
                              <div className="analytics-bar-wrap">
                                <div
                                  className="analytics-bar analytics-bar-success"
                                  style={{ width: `${(count / max) * 100}%` }}
                                />
                                <span className="analytics-value">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <div className="card card-custom">
                <div className="card-header">
                  <h5 className="mb-0">Key metrics</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="analytics-metric">
                        <span className="analytics-metric-value">
                          {stats.totalJobs ? (stats.totalApplications / stats.totalJobs).toFixed(1) : '0'}
                        </span>
                        <span className="analytics-metric-label">Avg applications per job</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="analytics-metric">
                        <span className="analytics-metric-value">
                          {stats.totalCompanies ? (stats.totalJobs / stats.totalCompanies).toFixed(1) : '0'}
                        </span>
                        <span className="analytics-metric-label">Avg jobs per company</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="analytics-metric">
                        <span className="analytics-metric-value">
                          {stats.totalCandidates ? (stats.totalApplications / stats.totalCandidates).toFixed(1) : '0'}
                        </span>
                        <span className="analytics-metric-label">Avg applications per candidate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {active === 'candidates' && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.email}</td>
                  <td><Link className="btn btn-sm btn-warning text-dark me-1" to={`/candidate/${c.id}`}>View</Link><button type="button" className="btn btn-sm btn-danger" onClick={() => deleteCandidate(c.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active === 'companies' && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead><tr><th>ID</th><th>Company</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.companyName}</td>
                  <td>{c.email}</td>
                  <td>
                    <span className={`badge ${
                      c.status === 'APPROVED' ? 'bg-success' :
                      c.status === 'REJECTED' ? 'bg-danger' :
                      'bg-warning text-dark'
                    }`}>
                      {c.status || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <Link className="btn btn-sm btn-warning text-dark me-1" to={`/company/${c.id}`}>View</Link>
                    {c.status !== 'APPROVED' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-success me-1"
                        onClick={() => approveCompany(c.id)}
                      >
                        Approve
                      </button>
                    )}
                    {c.status !== 'REJECTED' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger me-1"
                        onClick={() => rejectCompany(c.id)}
                      >
                        Reject
                      </button>
                    )}
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => deleteCompany(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active === 'jobs' && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead><tr><th>ID</th><th>Title</th><th>Company</th><th>Posted</th><th>Applications</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}><td>{j.id}</td><td>{j.title}</td><td>{j.companyName}</td><td>{formatDate(j.postedOn)}</td><td>{j.applicationCount}</td>
                  <td><Link className="btn btn-sm btn-warning text-dark me-1" to={`/applications/${j.id}`}>View</Link><Link className="btn btn-sm btn-warning text-dark me-1" to={`/post-job?edit=${j.id}`}>Edit</Link><button type="button" className="btn btn-sm btn-danger" onClick={() => deleteJob(j.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active === 'applications' && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead><tr><th>ID</th><th>Job</th><th>Candidate</th><th>Email</th><th>Applied</th><th>Action</th></tr></thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}><td>{a.id}</td><td>{a.jobTitle}</td><td>{a.candidateName}</td><td>{a.candidateEmail}</td><td>{formatDate(a.appliedAt)}</td>
                  <td><Link className="btn btn-sm btn-primary btn-primary-custom" to={`/applications/${a.jobId}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active === 'users' && (
        <div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Current Roles</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {editingUser?.id === user.id ? (
                        <div className="d-flex flex-column gap-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`role-candidate-${user.id}`}
                              checked={selectedRoles.includes('ROLE_CANDIDATE')}
                              onChange={() => toggleRole('ROLE_CANDIDATE')}
                            />
                            <label className="form-check-label" htmlFor={`role-candidate-${user.id}`}>
                              ROLE_CANDIDATE
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`role-company-${user.id}`}
                              checked={selectedRoles.includes('ROLE_COMPANY')}
                              onChange={() => toggleRole('ROLE_COMPANY')}
                            />
                            <label className="form-check-label" htmlFor={`role-company-${user.id}`}>
                              ROLE_COMPANY
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`role-admin-${user.id}`}
                              checked={selectedRoles.includes('ROLE_ADMIN')}
                              onChange={() => toggleRole('ROLE_ADMIN')}
                            />
                            <label className="form-check-label" htmlFor={`role-admin-${user.id}`}>
                              ROLE_ADMIN
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span key={role} className="badge bg-secondary me-1">{role}</span>
                            ))
                          ) : (
                            <span className="text-muted">No roles</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {editingUser?.id === user.id ? (
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handleSaveRoles(user.id)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setEditingUser(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : changingPassword?.id === user.id ? (
                        <div className="d-flex flex-column gap-2" style={{ minWidth: '200px' }}>
                          <input
                            type="password"
                            className="form-control form-control-sm"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <input
                            type="password"
                            className="form-control form-control-sm"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => handleSavePassword(user.id)}
                            >
                              Save Password
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setChangingPassword(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-warning text-dark"
                            onClick={() => handleEditRoles(user)}
                          >
                            Edit Roles
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-info text-white"
                            onClick={() => handleChangePassword(user)}
                          >
                            Change Password
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!users.length && <p className="text-muted">No users found.</p>}
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}
