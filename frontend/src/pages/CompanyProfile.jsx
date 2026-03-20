import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { showSuccess, showError } from '../utils/notifications';
import './CompanyProfile.css';

export default function CompanyProfile() {
  const { user, isCompany, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const canEdit = (isCompany() && user?.profileId) || isAdmin();

  useEffect(() => {
    api.get('/companies/me').then(({ data }) => {
      setProfile(data);
      setForm({
        companyName: data.companyName, industry: data.industry, companySize: data.companySize,
        headquarters: data.headquarters, companyType: data.companyType, founded: data.founded,
        specialities: data.specialities, address: data.address, companyPhone: data.companyPhone,
      });
    }).catch(() => {
      if (isAdmin()) navigate('/admin/dashboard');
      else showError('Company profile not found or access denied.');
    });
  }, [isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'founded' ? +value : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/companies/${profile.id}`, form);
      setProfile(data);
      setForm({
        companyName: data.companyName, industry: data.industry, companySize: data.companySize,
        headquarters: data.headquarters, companyType: data.companyType, founded: data.founded,
        specialities: data.specialities, address: data.address, companyPhone: data.companyPhone,
      });
      setEdit(false);
      showSuccess('Company profile updated successfully!');
    } catch (err) {
      showError(err.response?.data?.error || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="container py-5 text-center"><span className="spinner-border text-primary" />;</div>;

  return (
    <div className="container py-5 company-profile-page">
      <div className="card card-custom page-card mx-auto p-4 shadow-sm">
        {edit ? (
          <>
            <h2 className="mb-4">Edit Company Profile</h2>
            <form onSubmit={handleSave}>
              <div className="row g-2 mb-3">
                <div className="col-12"><label className="form-label">Company Name</label><input type="text" className="form-control" name="companyName" value={form.companyName || ''} onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">Industry</label><input type="text" className="form-control" name="industry" value={form.industry || ''} onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">Size</label><input type="text" className="form-control" name="companySize" value={form.companySize || ''} onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">Headquarters</label><input type="text" className="form-control" name="headquarters" value={form.headquarters || ''} onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">Type</label><input type="text" className="form-control" name="companyType" value={form.companyType || ''} onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">Founded</label><input type="number" className="form-control" name="founded" value={form.founded || ''} onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">Specialities</label><textarea className="form-control" name="specialities" value={form.specialities || ''} onChange={handleChange} rows={2} /></div>
                <div className="col-12"><label className="form-label">Address</label><input type="text" className="form-control" name="address" value={form.address || ''} onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">Phone</label><input type="text" className="form-control" name="companyPhone" value={form.companyPhone || ''} onChange={handleChange} /></div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success btn-success-custom" disabled={loading}>Save Changes</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setEdit(false)}>Cancel</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h4 className="mb-3">{profile?.companyName}</h4>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Phone:</strong> {profile?.companyPhone || '-'}</p>
            <p><strong>Address:</strong> {profile?.address || '-'}</p>
            <p><strong>Industry:</strong> {profile?.industry}</p>
            <p><strong>Size:</strong> {profile?.companySize}</p>
            <p><strong>Headquarters:</strong> {profile?.headquarters}</p>
            <p><strong>Type:</strong> {profile?.companyType}</p>
            <p><strong>Founded:</strong> {profile?.founded}</p>
            <p><strong>Specialities:</strong> {profile?.specialities || '-'}</p>
            <div className="d-flex gap-2 flex-wrap">
              <Link className="btn btn-primary btn-primary-custom" to="/company/dashboard">Go to Company Dashboard</Link>
              <Link className="btn btn-success btn-success-custom" to="/post-job">Post New Job</Link>
              {canEdit && <button type="button" className="btn btn-outline-secondary" onClick={() => setEdit(true)}>Edit Profile</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
