import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { showError } from '../utils/notifications';
import './ReportCandidate.css';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function ReportCandidate() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(() => {
    setLoading(true);
    api.get('/report/candidate', { params: search ? { search } : {} })
      .then(({ data }) => setRows(data))
      .catch((e) => {
        showError(e.response?.data?.error || 'You are not authorized to view reports from other companies.');
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [search]);

  const exportExcel = () => {
    api.get('/report/candidate/export', {
      params: search ? { search } : {},
      responseType: 'blob'
    })
      .then(({ data }) => {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'candidate-report.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((e) => {
        showError(e.response?.data?.error || 'Export failed. Please try again.');
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="container py-5 report-candidate-page">
      <h2 className="mb-4 page-title">Candidate Report</h2>
      <div className="d-flex gap-2 mb-4">
        <input
          type="text"
          className="form-control search-control"
          placeholder="Search by Name or Email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn btn-primary btn-primary-custom" onClick={fetchReport}>Search</button>
        <button type="button" className="btn btn-success btn-success-custom" onClick={exportExcel}>Export Excel</button>
      </div>
      {loading && <div className="text-center py-4"><span className="spinner-border text-primary" /></div>}
      {!loading && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Gender</th>
                <th>Education</th>
                <th>Work Exp</th>
                <th>Skills</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.mobile || '-'}</td>
                  <td>{r.gender || '-'}</td>
                  <td>{r.education || '-'}</td>
                  <td>{r.workExperience || '-'}</td>
                  <td>{r.skills || '-'}</td>
                  <td>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !rows.length && <p className="text-muted">No candidates found.</p>}
    </div>
  );
}
