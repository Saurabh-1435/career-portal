import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import './home.css';

export default function Home() {
  const { isLoggedIn, isCandidate } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalCandidates: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let loadedCount = 0;
    const totalLoads = 3;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalLoads) setLoading(false);
    };

    api.get('/jobs/public/stats')
      .then(({ data }) => setStats(prev => ({
        ...prev,
        totalJobs: data.totalJobs || 0,
        totalCompanies: data.totalCompanies || 0,
        totalCandidates: data.totalCandidates || 0,
        successRate: data.successRate || 0
      })))
      .catch(() => {})
      .finally(() => checkComplete());

    api.get('/jobs/public/categories')
      .then(({ data }) => setCategories(data || []))
      .catch(() => setCategories([]))
      .finally(() => checkComplete());

    if (isLoggedIn() && localStorage.getItem('token')) {
      api.get('/jobs')
        .then(({ data }) => {
          setJobs(data || []);
          setStats(prev => ({ ...prev, totalJobs: data?.length || prev.totalJobs }));
        })
        .catch(() => setJobs([]))
        .finally(() => checkComplete());
    } else checkComplete();
  }, [isLoggedIn]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.append('search', searchKeyword);
    if (searchLocation) params.append('location', searchLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleCategoryClick = (categoryName) => {
    const params = new URLSearchParams();
    if (categoryName !== 'All Jobs') params.append('industry', categoryName);
    navigate(categoryName === 'All Jobs' ? '/jobs' : `/jobs?${params.toString()}`);
  };

  const formatSalary = (salary) => (!salary ? 'Not specified' : `$${Number(salary).toLocaleString()}`);
  const featuredJobs = jobs.slice(0, 3);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-container fade-in">
          <h1 className="hero-title slide-up">Welcome to CareerConnect</h1>
          <p className="hero-subtitle slide-up">
            Discover top job opportunities and connect with employers that match your skills
          </p>
          <form onSubmit={handleSearch} className="search-container slide-up">
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Job title, keywords, or company"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <div className="search-input-wrapper">
                <span className="search-icon">📍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Location or Remote"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="search-button">Search</button>
            </div>
          </form>
          {!isLoggedIn() && (
            <div className="cta-container slide-up">
              <Link to="/role" className="btn-primary">Get Started</Link>
              <Link to="/login" className="btn-secondary">Sign In</Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            {[
              { label: 'Active Jobs', value: stats.totalJobs, icon: '📋' },
              { label: 'Companies', value: stats.totalCompanies, icon: '🏢' },
              { label: 'Job Seekers', value: stats.totalCandidates, icon: '👩‍💼' },
              { label: 'Success Rate', value: stats.successRate + '%', icon: '🚀' }
            ].map((stat, idx) => (
              <div key={idx} className={`stat-card slide-up`} style={{ animationDelay: `${0.2 * idx}s` }}>
                <div className="stat-icon-wrapper">{stat.icon}</div>
                <div className="stat-value">{stat.value.toLocaleString ? stat.value.toLocaleString() : stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="category-section">
        <div className="category-container">
          <h2 className="category-title fade-in">Browse by Category</h2>
          <div className="category-grid">
            {(categories.length ? categories.slice(0,5) : [
              { name: 'All Jobs', icon: '📁', count: 0 },
              { name: 'Technology', icon: '💻', count: 0 },
              { name: 'Design', icon: '🎨', count: 0 },
              { name: 'Marketing', icon: '📢', count: 0 },
              { name: 'Finance', icon: '💰', count: 0 },
            ]).map((cat, idx) => (
              <div key={idx} className="category-card slide-up" style={{ animationDelay: `${0.1*idx}s` }} onClick={() => handleCategoryClick(cat.name)}>
                <div className="category-icon-wrapper"><span className="category-icon">{cat.icon}</span></div>
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-count">{cat.count} jobs</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="jobs-section">
        <div className="jobs-container">
          <div className="jobs-header fade-in">
            <h2 className="jobs-title">Featured Opportunities</h2>
            <Link to="/jobs" className="view-all-link">View All Jobs →</Link>
          </div>
          {loading ? (
            <div className="text-center py-4"><span className="spinner-border" /></div>
          ) : featuredJobs.length ? (
            <div className="jobs-grid">
              {featuredJobs.map((job, idx) => (
                <div key={job.id} className="job-card slide-up" style={{ animationDelay: `${0.2*idx}s` }}>
                  <div className="job-card-content">
                    <div className="job-header">
                      <div className="job-company-info">
                        <div className="job-logo">🏢</div>
                        <div>
                          <h3 className="job-title">{job.title}</h3>
                          <p className="job-company">{job.companyName || 'Company'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="job-meta">
                      <span className="meta-badge badge-location">{job.location || 'Not specified'}</span>
                      <span className="meta-badge badge-salary">{formatSalary(job.salary)}</span>
                    </div>
                    <div className="job-skills">{job.description ? job.description.slice(0,50)+'...' : 'Full-time'}</div>
                    <Link to={isCandidate() ? `/apply/${job.id}` : `/job/${job.id}`} className="apply-btn">
                      {isCandidate() ? 'Apply Now' : 'View Details'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted">No jobs available yet. Check back soon!</div>
          )}
        </div>
      </section>
    </div>
  );
}