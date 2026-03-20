import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <h3>CareerPortal</h3>
              <p>Your gateway to career success</p>
            </div>
          </div>

          <div className="footer-section">
            <h4>For Job Seekers</h4>
            <ul>
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>For Employers</h4>
            <ul>
              {/*<li><Link to="/post-job">Post a Job</Link></li>*/}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/forgot-password">Forgot Password</Link></li>
              <li><a href="mailto:support@careerportal.com">Contact Us</a></li>
              {/*<li><Link to="/test-notifications">Test Notifications</Link></li>*/}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="https://www.linkedin.com" aria-label="LinkedIn">
                <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://x.com" aria-label="Twitter">
                <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com" aria-label="Facebook">
                <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com" aria-label="Instagram">
                <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C8.396 0 7.945.011 6.744.065 5.544.118 4.657.346 3.915.681c-.754.334-1.394.986-2.028 1.62C1.253 2.935.601 3.575.267 4.329.118 5.13 0 6.017 0 7.217v9.566c0 1.2.118 2.087.267 2.888.334.754.986 1.394 1.62 2.028.634.634 1.274 1.286 2.028 1.62.758.334 1.645.562 2.845.615 1.201.054 1.652.065 5.273.065s4.072-.011 5.273-.065c1.2-.053 2.087-.281 2.845-.615.754-.334 1.394-.986 2.028-1.62.634-.634 1.286-1.274 1.62-2.028.149-.801.267-1.688.267-2.888V7.217c0-1.2-.118-2.087-.267-2.888-.334-.754-.986-1.394-1.62-2.028-.634-.634-1.274-1.286-2.028-1.62-.758-.334-1.645-.562-2.845-.615C16.072.011 15.621 0 12 0zM11.988 1.609c4.519 0 5.059.019 6.85.073 1.662.051 2.591.341 3.223.676.717.382 1.297.943 1.679 1.679.382.717.943 1.297 1.679 1.679.335.632.625 1.561.676 3.223.054 1.791.073 2.331.073 6.85s-.019 5.059-.073 6.85c-.051 1.662-.341 2.591-.676 3.223-.382.717-.943 1.297-1.679 1.679-.717.382-1.297.943-1.679 1.679-.632.335-1.561.625-3.223.676-1.791.054-2.331.073-6.85.073s-5.059-.019-6.85-.073c-1.662-.051-2.591-.341-3.223-.676-.717-.382-1.297-.943-1.679-1.679-.382-.717-.943-1.297-1.679-1.679-.335-.632-.625-1.561-.676-3.223C1.609 16.072 1.59 15.621 1.59 12c0-4.519.019-5.059.073-6.85.051-1.662.341-2.591.676-3.223.382-.717.943-1.297 1.679-1.679.717-.382 1.297-.943 1.679-1.679.632-.335 1.561-.625 3.223-.676 1.791-.054 2.331-.073 6.85-.073zm0 4.464c-4.665 0-8.447 3.782-8.447 8.447s3.782 8.447 8.447 8.447 8.447-3.782 8.447-8.447S16.653 6.073 12.017 6.073zm0 13.928c-3.199 0-5.797-2.598-5.797-5.797s2.598-5.797 5.797-5.797 5.797 2.598 5.797 5.797-2.598 5.797-5.797 5.797zm8.894-14.263c-1.085 0-1.966-.881-1.966-1.966s.881-1.966 1.966-1.966 1.966.881 1.966 1.966-.881 1.966-1.966 1.966z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} CareerPortal. All rights reserved.</p>
           <div className="d-flex gap-3">
          <Link className="text-white text-decoration-none" to="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="text-white text-decoration-none" to="/terms-of-service">
            Terms of Service
          </Link>
          <Link className="text-white text-decoration-none" to="/cookie-policy">
            Cookie Policy
          </Link>
        </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
