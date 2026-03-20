import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import './CompanyView.css';

export default function CompanyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/access-denied');
      return;
    }
    api.get(`/companies/${id}`).then(({ data }) => setProfile(data)).catch(() => setError('Not found')).finally(() => setLoading(false));
  }, [id, isAdmin, navigate]);

  if (loading) return <div className="container py-5 text-center"><span className="spinner-border text-primary" /></div>;
  if (error || !profile) return <div className="container py-5"><div className="alert alert-danger">{error || 'Not found'}</div><button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Back</button></div>;

  return (
    <div className="container py-5 company-view-page">
      <div className="card card-custom page-card mx-auto p-4 shadow-sm">
        <h4 className="mb-3">{profile.companyName}</h4>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.companyPhone || '-'}</p>
        <p><strong>Address:</strong> {profile.address || '-'}</p>
        <p><strong>Industry:</strong> {profile.industry}</p>
        <p><strong>Size:</strong> {profile.companySize}</p>
        <p><strong>Headquarters:</strong> {profile.headquarters}</p>
        <p><strong>Type:</strong> {profile.companyType}</p>
        <p><strong>Founded:</strong> {profile.founded}</p>
        <p><strong>Specialities:</strong> {profile.specialities || '-'}</p>
        <Link className="btn btn-primary btn-primary-custom me-2" to="/admin/dashboard">Back to Admin</Link>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}
