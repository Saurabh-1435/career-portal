import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import './jobs.css';
function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function Jobs() {
  const { isCandidate, isAdmin, isCompany } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '');
  const [searchLocation, setSearchLocation] = useState(searchParams.get('location') || '');

  useEffect(() => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const industry = searchParams.get('industry');

    if (search) params.append('search', search);
    if (location) params.append('location', location);
    if (industry) params.append('industry', industry);

    const queryString = params.toString();
    const url = queryString ? `/jobs?${queryString}` : '/jobs';

    api.get(url).then(({ data }) => setJobs(data)).catch(() => setJobs([])).finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.append('search', searchKeyword.trim());
    if (searchLocation.trim()) params.append('location', searchLocation.trim());
    setSearchParams(params);
  };

  const showApply = isCandidate() || (isAdmin() && !isCompany());

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="mb-2">Available Job Openings</h2>
          <p className="text-muted mb-0">Explore the latest opportunities that suit your skills.</p>
        </div>
      </div>

      {/* Search Form - Now Styled! */}
      <div className="card card-custom mb-5">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-5">
              <label className="form-label">Job Title or Keyword</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Software Engineer"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Remote, New York"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button type="submit" className="btn btn-primary btn-primary-custom w-100">
                Search Jobs
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!loading && (
        <div className="row g-4">
          {jobs.map((j) => (
            <div key={j.id} className="col-12 col-md-6 col-lg-4">
              <div className="card card-custom h-100 d-flex flex-column">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{j.title}</h5>
                  
                  <div className="mb-3">
                    <p className="card-text text-muted mb-2">
                      <span className="me-2">📍</span> {j.location || 'Remote'}
                    </p>
                    <p className="card-text text-muted mb-2">
                      <span className="me-2">💰</span> {j.salary ? `$${Number(j.salary).toLocaleString()}` : 'Not specified'}
                    </p>
                    <p className="card-text text-muted mb-0">
                      <span className="me-2">📅</span> {formatDate(j.postedOn)}
                    </p>
                  </div>

                  <div className="mt-auto d-flex gap-2 pt-3 border-top">
                    <Link className="btn btn-sm btn-outline-secondary flex-grow-1" to={`/job/${j.id}`}>
                      View Details
                    </Link>
                    {showApply && (
                      <Link className="btn btn-sm btn-primary btn-primary-custom flex-grow-1" to={`/apply/${j.id}`}>
                        Apply
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !jobs.length && (
        <div className="text-muted no-jobs">
          No jobs found matching your criteria.
        </div>
      )}
    </div>
  );
}
