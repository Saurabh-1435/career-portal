import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import './CandidateView.css';

export default function CandidateView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/access-denied');
      return;
    }
    api.get(`/candidates/${id}`).then(({ data }) => setProfile(data)).catch(() => setError('Not found')).finally(() => setLoading(false));
  }, [id, isAdmin, navigate]);

  useEffect(() => {
    if (!profile?.hasPhoto) return;
    api.get(`/candidates/${profile.id}/photo`)
      .then(({ data }) => {
        if (data?.url) {
          setPhotoUrl(data.url);
        }
      })
      .catch(() => {});
  }, [profile?.id, profile?.hasPhoto]);

  const downloadResume = () => {
    api.get(`/candidates/${profile.id}/resume`, { responseType: 'blob' }).then(({ data }) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = profile?.resumeFileName || 'resume.pdf';
      a.click();
      URL.revokeObjectURL(url);
    }).catch(() => {});
  };

  if (loading) return <div className="container py-5 text-center"><span className="spinner-border text-primary" /></div>;
  if (error || !profile) return <div className="container py-5"><div className="alert alert-danger">{error || 'Not found'}</div><button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Back</button></div>;

  return (
    <div className="container py-5 candidate-view-page">
      <div className="card card-custom page-card mx-auto p-4 shadow-sm">
        <div className="d-flex align-items-center gap-3 profile-header mb-4">
          {photoUrl && <img src={photoUrl} alt="" className="rounded-circle profile-photo" />}
          <div>
            <h4 className="mb-0">{profile.name}</h4>
            <p className="text-muted mb-0">{profile.email}</p>
          </div>
        </div>
        <p><strong>DOB:</strong> {profile.dob}</p>
        <p><strong>Education:</strong> {profile.education}</p>
        <p><strong>Mobile:</strong> {profile.mobile}</p>
        <p><strong>Status:</strong> {profile.status}</p>
        <p><strong>Gender:</strong> {profile.gender}</p>
        <p><strong>Work Experience:</strong> {profile.workExperience || '-'}</p>
        <p><strong>Skills:</strong> {profile.skills || '-'}</p>
        {profile.hasResume && <button type="button" className="btn btn-success btn-success-custom" onClick={downloadResume}>Download Resume</button>}
        <button type="button" className="btn btn-outline-secondary ms-2" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}
