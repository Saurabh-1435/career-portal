import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { showSuccess } from '../utils/notifications';
import api from '../api/axios';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isCandidate, isCompany, isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const handleLogout = () => {
    logout();
    showSuccess('You have been logged out successfully. See you next time!');
    navigate('/');
  };

  const isCandidateUser = Boolean(user?.roles?.includes('ROLE_CANDIDATE') && user?.profileId);
  const displayProfileImageUrl = isCandidateUser ? profileImageUrl : null;

  // Load profile image for candidates
  useEffect(() => {
    if (!isCandidateUser || !isLoggedIn()) {
      setProfileImageUrl(null);
      return;
    }
    
    api.get('/candidates/me')
      .then(({ data }) => {
        if (data?.hasPhoto) {
          return api.get(`/candidates/${user.profileId}/photo`).then(({ data: photoData }) => photoData?.url);
        }
        return null;
      })
      .then((url) => setProfileImageUrl(url ?? null))
      .catch((err) => {
        // Handle 403 gracefully - user might not have proper authorization
        // Only log unexpected errors (network issues, 500s, etc.)
        if (err.response?.status !== 403) {
          console.error('Failed to load profile image:', err);
        }
        setProfileImageUrl(null);
      });
  }, [user?.profileId, isCandidateUser, isLoggedIn]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#001f3f' }}>
      <div className="container">
        <Link className="navbar-brand" to="/">CareerPortal</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            {isLoggedIn() && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/jobs">Jobs</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/companies">Companies</Link></li>
                {isCandidate() && (
                  <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>
                )}
                {isCompany() && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/company/profile">Company-Profile</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/company/dashboard">Dashboard</Link></li>
                  </>
                )}
                {(isCompany() || isAdmin()) && (
                  <li className="nav-item"><Link className="nav-link" to="/report/candidate">candidate-Report</Link></li>
                )}
                {isAdmin() && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/report/company">company-Reports</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/admin/dashboard">Admin Dashboard</Link></li>
                  </>
                )}
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {isLoggedIn() ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" onClick={(ev) => ev.preventDefault()}>
                  {displayProfileImageUrl ? (
                    <img
                      src={displayProfileImageUrl}
                      alt="Profile"
                      className="me-2 rounded-circle border border-light"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      onError={() => {
                        console.error('Profile image failed to load:', displayProfileImageUrl);
                        setProfileImageUrl(null);
                      }}
                    />
                  ) : (
                    <div className="me-2 d-flex align-items-center justify-content-center bg-light rounded-circle border border-light"
                         style={{ width: '32px', height: '32px' }}>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="text-secondary">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                      </svg>
                    </div>
                  )}
                  {user?.name || user?.username || 'Profile'}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                  {isCandidate() && (
                    <>
                      <li><Link className="dropdown-item" to="/profile">
                        <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                          <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                        </svg>
                        My Profile
                      </Link></li>
                      <li><Link className="dropdown-item" to="/candidate/dashboard">
                        <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.602 0 1.068-.08 1.466-.217.39-.136.698-.319.97-.484l.048-.03c.504-.308.998-.609 2.068-.723C14.318 14.185 15 13.566 15 12.72V8.72c0-.85-.685-1.432-1.357-1.615-.849-.232-1.574-.787-2.131-1.41-.562-.626-.915-1.28-1.04-1.639-.199-.575-.356-1.54-.428-2.59-.072-.95-.957-1.653-1.915-1.466l-.004-.001zM4.932 3.487c-.635-.216-1.328-.219-1.974-.01-.676.233-1.228.682-1.554 1.263-.326.58-.423 1.325-.4 2.302.024.954.21 1.804.528 2.421.29.596.762 1.004 1.277 1.244.556.262 1.21.422 1.96.482.765.064 1.534-.036 2.211-.199.676-.163 1.263-.474 1.766-.924.492-.446.832-1.045.971-1.716.132-.646.165-1.319.1-1.979-.07-.678-.301-1.271-.67-1.742-.382-.483-.93-.817-1.508-.98-.635-.19-1.297-.162-1.936.027z"/>
                        </svg>
                        My Dashboard
                      </Link></li>
                    </>
                  )}
                  {isCompany() && (
                    <li><Link className="dropdown-item" to="/company/profile">
                      <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.467-.994-3.68-1.1-1.508-.148-2.827-.793-3.18-1.504V2.828zm7.578-.351c.645-.814 1.814-1.207 3.16-1.272 1.236-.063 2.419.234 3.23.897v9.813c-.77-.564-2.069-.94-3.304-1.057-1.361-.129-2.601-.476-3.254-1.019V2.477z"/>
                        <path fillRule="evenodd" d="M14.64 1.595a.5.5 0 0 1 .772.636l-1.69 2.064a.5.5 0 0 0 .768.641l1.69-2.064a.5.5 0 0 0-.768-.641l-1.69 2.064a.5.5 0 0 0 .768.641z"/>
                      </svg>
                      Company Profile
                    </Link></li>
                  )}
                  {isAdmin() && (
                    <li><Link className="dropdown-item" to="/admin/dashboard">
                      <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.602 0 1.068-.08 1.466-.217.39-.136.698-.319.97-.484l.048-.03c.504-.308.998-.609 2.068-.723C14.318 14.185 15 13.566 15 12.72V8.72c0-.85-.685-1.432-1.357-1.615-.849-.232-1.574-.787-2.131-1.41-.562-.626-.915-1.28-1.04-1.639-.199-.575-.356-1.54-.428-2.59-.072-.95-.957-1.653-1.915-1.466l-.004-.001zM4.932 3.487c-.635-.216-1.328-.219-1.974-.01-.676.233-1.228.682-1.554 1.263-.326.58-.423 1.325-.4 2.302.024.954.21 1.804.528 2.421.29.596.762 1.004 1.277 1.244.556.262 1.21.422 1.96.482.765.064 1.534-.036 2.211-.199.676-.163 1.263-.474 1.766-.924.492-.446.832-1.045.971-1.716.132-.646.165-1.319.1-1.979-.07-.678-.301-1.271-.67-1.742-.382-.483-.93-.817-1.508-.98-.635-.19-1.297-.162-1.936.027z"/>
                      </svg>
                      Admin Dashboard
                    </Link></li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>
                    <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0l-1.5 1.5a.5.5 0 0 0 .708.708L11.5 6.793V10.5a.5.5 0 0 0 1 0V6.793l1.646 1.646a.5.5 0 0 0 .708-.708l-1.5-1.5z"/>
                    </svg>
                    Logout
                  </button></li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item me-2">
                  <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-primary-custom btn-sm" to="/role">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
