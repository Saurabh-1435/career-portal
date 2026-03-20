import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { showSuccess, showError } from '../utils/notifications';
import './Profile.css';

export default function Profile() {
  const { user, isCandidate, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [clearResume, setClearResume] = useState(false);
  const [clearPhoto, setClearPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  const canEdit = isCandidate() && user?.profileId;
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    api.get('/candidates/me').then(({ data }) => {
      setProfile(data);
      setForm({ name: data.name, mobile: data.mobile, dob: data.dob, gender: data.gender, education: data.education, workExperience: data.workExperience, skills: data.skills });
    }).catch(() => {
      if (isAdmin()) navigate('/admin/dashboard');
      else showError('Profile not found or access denied.');
    });
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!profile?.id || !profile?.hasPhoto) return;
    api.get(`/candidates/${profile.id}/photo`)
      .then(({ data }) => {
        if (data?.url) {
          setPhotoUrl(data.url);
        }
      })
      .catch((err) => {
        // Silently fail for photo - it's optional
        console.error('Failed to load photo:', err);
      });
  }, [profile?.id, profile?.hasPhoto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v != null && v !== '') fd.append(k, v);
    });
    if (resume?.length) fd.append('resume', resume[0]);
    if (photo?.length) fd.append('photo', photo[0]);
    if (clearResume) fd.append('clearResume', 'true');
    if (clearPhoto) fd.append('clearPhoto', 'true');
    try {
      const { data } = await api.put(`/candidates/${profile.id}`, fd);
      setProfile(data);
      setForm({ name: data.name, mobile: data.mobile, dob: data.dob, gender: data.gender, education: data.education, workExperience: data.workExperience, skills: data.skills });
      setEdit(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError(err.response?.data?.error || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    api.get(`/candidates/${profile.id}/resume`, { responseType: 'blob' }).then(({ data }) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = profile.resumeFileName || 'resume.pdf';
      a.click();
      URL.revokeObjectURL(url);
    }).catch(() => showError('Failed to download resume. Please try again.'));
  };

  if (!profile) return <div className="container py-5 text-center"><span className="spinner-border text-primary" /></div>;

  return (
    <div className="container py-5">
      <div className="card card-custom mx-auto p-4 shadow-sm" style={{ maxWidth: '640px' }}>
        {edit ? (
          <>
            <h2 className="mb-4">Update Your Profile</h2>
            <form onSubmit={handleSave}>
              <h6 className="mb-2">Personal Details</h6>
              <div className="row g-2 mb-3">
                <div className="col-12"><label className="form-label">Name</label><input type="text" className="form-control" name="name" value={form.name || ''} onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">Mobile</label><input type="text" className="form-control" name="mobile" value={form.mobile || ''} onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">DOB</label><input type="date" className="form-control" name="dob" value={form.dob || ''} onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">Gender</label><select className="form-select" name="gender" value={form.gender || ''} onChange={handleChange}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                <div className="col-12"><label className="form-label">Education</label><textarea className="form-control" name="education" value={form.education || ''} onChange={handleChange} rows={2} /></div>
              </div>
              <h6 className="mb-2">Professional Info</h6>
              <div className="row g-2 mb-3">
                <div className="col-12"><label className="form-label">Work Experience</label><textarea className="form-control" name="workExperience" value={form.workExperience || ''} onChange={handleChange} rows={2} /></div>
                <div className="col-12"><label className="form-label">Skills</label><textarea className="form-control" name="skills" value={form.skills || ''} onChange={handleChange} rows={2} /></div>
              </div>
              <h6 className="mb-2">Attachments</h6>
              <div className="mb-3">
                <label className="form-label">Resume</label>
                {profile?.resumeFileName && !clearResume && <><span className="me-2">{profile.resumeFileName}</span><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setClearResume(true)}>Clear</button></>}
                <input type="file" className="form-control mt-1" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Photo</label>
                {profile?.photoFileName && !clearPhoto && <><span className="me-2">{profile.photoFileName}</span><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setClearPhoto(true)}>Clear</button></>}
                <input type="file" className="form-control mt-1" accept="image/*" onChange={(e) => setPhoto(e.target.files)} />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-primary-custom" disabled={loading}>Save Profile</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setEdit(false)}>Cancel</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="d-flex align-items-center gap-3 mb-4">
              {photoUrl && <img src={photoUrl} alt="" className="rounded-circle" style={{ width: 80, height: 80, objectFit: 'cover' }} />}
              <div>
                <h4 className="mb-0">{profile?.name}</h4>
                <p className="text-muted mb-0">{profile?.email}</p>
              </div>
            </div>
            <p><strong>DOB:</strong> {profile?.dob}</p>
            <p><strong>Education:</strong> {profile?.education}</p>
            <p><strong>Mobile:</strong> {profile?.mobile}</p>
            <p><strong>Status:</strong> {profile?.status}</p>
            <p><strong>Gender:</strong> {profile?.gender}</p>
            <p><strong>Work Experience:</strong> {profile?.workExperience || '-'}</p>
            <p><strong>Skills:</strong> {profile?.skills || '-'}</p>
            {profile?.hasResume && <button type="button" className="btn btn-success btn-success-custom me-2" onClick={downloadResume}>Download Resume</button>}
            {canEdit && <button type="button" className="btn btn-primary btn-primary-custom" onClick={() => setEdit(true)}>Edit Profile</button>}
          </>
        )}
      </div>
    </div>
  );
}
