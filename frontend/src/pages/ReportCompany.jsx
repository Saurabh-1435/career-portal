import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { showError } from '../utils/notifications';
import './ReportCompany.css';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function ReportCompany() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [after, setAfter] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(() => {
    setLoading(true);
    api.get('/report/company', { params: { name: name || undefined, email: email || undefined, industry: industry || undefined, after: after || undefined } })
      .then(({ data }) => setRows(data))
      .catch((e) => {
        showError(e.response?.data?.error || 'Not authorized.');
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [after, email, industry, name]);

  const exportExcel = () => {
    api.get('/report/company/export', {
      params: { name: name || undefined, email: email || undefined, industry: industry || undefined, after: after || undefined },
      responseType: 'blob',
    }).then(({ data }) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'company-report.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    }).catch(() => showError('Export failed. Please try again.'));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="container py-5 report-company-page">
      <h2 className="mb-4 page-title">Company Profiles Report</h2>
      <div className="row g-2 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <input type="text" className="form-control" placeholder="Company Name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <input type="text" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="col-12 col-md-6 col-lg-2">
          <input type="text" className="form-control" placeholder="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </div>
        <div className="col-12 col-md-6 col-lg-2">
          <input type="date" className="form-control" placeholder="After" value={after} onChange={(e) => setAfter(e.target.value)} />
        </div>
        <div className="col-12 col-md-6 col-lg-2">
          <button type="button" className="btn btn-primary btn-primary-custom me-1" onClick={fetchReport}>Search</button>
          <button type="button" className="btn btn-success btn-success-custom" onClick={exportExcel}>Export Excel</button>
        </div>
      </div>
      {loading && <div className="text-center py-4"><span className="spinner-border text-primary" /></div>}
      {!loading && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Industry</th>
                <th>Size</th>
                <th>Headquarters</th>
                <th>Type</th>
                <th>Specialities</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.companyName}</td>
                  <td>{r.email}</td>
                  <td>{r.companyPhone || '-'}</td>
                  <td>{r.industry || '-'}</td>
                  <td>{r.companySize || '-'}</td>
                  <td>{r.headquarters || '-'}</td>
                  <td>{r.companyType || '-'}</td>
                  <td>{r.specialities || '-'}</td>
                  <td>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !rows.length && <p className="text-muted">No companies found.</p>}
    </div>
  );
}
