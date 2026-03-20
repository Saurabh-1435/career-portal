import { useState, useEffect } from 'react';
import api from '../api/axios';
import './companies.css';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/companies').then(({ data }) => setCompanies(data)).catch(() => setCompanies([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5">
      <h2 className="mb-4">Companies</h2>
      {loading && <div className="text-center py-4"><span className="spinner-border text-primary" /></div>}
      {!loading && (
        <div className="row g-4">
          {companies.map((c) => (
            <div key={c.id} className="col-12 col-md-6 col-lg-4">
              <div className="card card-custom h-100">
                <div className="card-body">
                  <h5 className="card-title">{c.companyName}</h5>
                  <p className="card-text text-muted mb-1">{c.industry}</p>
                  <p className="card-text text-muted mb-0">{c.headquarters}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !companies.length && <p className="text-muted">No companies yet.</p>}
    </div>
  );
}
