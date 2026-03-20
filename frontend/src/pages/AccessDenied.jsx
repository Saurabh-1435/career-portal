import { Link } from 'react-router-dom';
import './AccessDenied.css';

export default function AccessDenied() {
  return (
    <div className="container py-5 access-denied-page">
      <div className="card card-custom page-card mx-auto text-center p-5 shadow-sm">
        <div className="display-1 text-danger mb-3">⛔</div>
        <h2 className="mb-3">Access Denied</h2>
        <p className="text-muted mb-4">
          You are not authorized to access this page. If you believe this is an error, please return to your dashboard or contact support.
        </p>
        <Link className="btn btn-primary btn-primary-custom" to="/">Back to Home</Link>
      </div>
    </div>
  );
}
