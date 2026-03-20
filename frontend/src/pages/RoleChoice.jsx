// import { Link } from 'react-router-dom';
// import { UserCircle, Building, CheckCircle, Briefcase } from 'lucide-react';
// import './RoleChoice.css';

// export default function RoleChoice() {
//   return (
//     <div className="role-choice-wrapper">
//       <div className="role-choice-container">

//         {/* Header */}
//         <div className="role-choice-header">
//           <div className="brand-icon">
//             <Briefcase className="brand-icon-svg" />
//           </div>
//           <h1 className="main-title">Welcome to JobPortal</h1>
//           <p className="main-subtitle">Choose how you want to continue</p>
//         </div>

//         {/* Role Cards */}
//         <div className="role-cards-grid">

//           {/* Candidate Card */}
//           <Link to="/register/candidate" className="role-card role-card-candidate">
//             <div className="role-card-content">

//               <div className="role-icon role-icon-candidate">
//                 <UserCircle className="role-icon-svg" />
//               </div>

//               <h2 className="role-title">I'm a Candidate</h2>

//               <p className="role-description">
//                 Looking for your dream job? Explore thousands of opportunities from top companies.
//               </p>

//               <div className="role-features">
//                 <div className="feature-item">
//                   <CheckCircle className="feature-icon feature-icon-candidate" />
//                   <span>Browse job listings</span>
//                 </div>
//                 <div className="feature-item">
//                   <CheckCircle className="feature-icon feature-icon-candidate" />
//                   <span>Apply to multiple jobs</span>
//                 </div>
//                 <div className="feature-item">
//                   <CheckCircle className="feature-icon feature-icon-candidate" />
//                   <span>Track your applications</span>
//                 </div>
//                 <div className="feature-item">
//                   <CheckCircle className="feature-icon feature-icon-candidate" />
//                   <span>Build your profile</span>
//                 </div>
//               </div>

//               {/* div instead of button (HTML safe) */}
//               <div className="role-button role-button-candidate">
//                 Register as Candidate
//               </div>

//             </div>
//           </Link>

//           {/* Company Card */}
//           <Link to="/register/company" className="role-card role-card-company">
//             <div className="role-card-content">

//               <div className="role-icon role-icon-company">
//                 <Building className="role-icon-svg" />
//               </div>

//               <h2 className="role-title">I'm a Company</h2>

//               <p className="role-description">
//                 Find the best talent for your company. Post jobs and manage applications efficiently.
//               </p>

//               <div className="role-features">
//                 <div className="feature-item">
//                   <CheckCircle className="feature-icon feature-icon-company" />
//                   <span>Post unlimited jobs</span>
//                 </div>
//                 <div className="feature-item">
//                   <CheckCircle className="feature-icon feature-icon-company" />
//                   <span>Access candidate database</span>
//                 </div>
//                 <div className="feature-item">
//                   <CheckCircle className="feature-icon feature-icon-company" />
//                   <span>Manage applications</span>
//                 </div>
//                 <div className="feature-item">
//                   <CheckCircle className="feature-icon feature-icon-company" />
//                   <span>Analytics dashboard</span>
//                 </div>
//               </div>

//               {/* div instead of button (HTML safe) */}
//               <div className="role-button role-button-company">
//                 Register as Company
//               </div>

//             </div>
//           </Link>

//         </div>

//         {/* Login */}
//         <div className="login-section">
//           <p>
//             Already have an account?{' '}
//             <Link to="/login" className="login-link">Login</Link>
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// }


import { Link } from 'react-router-dom';
import { UserCircle, Building, CheckCircle, Briefcase } from 'lucide-react';
import './RoleChoice.css';

export default function RoleChoice() {
  return (
    <div className="role-wrapper">
      <div className="role-container">

        {/* Header */}
        <div className="role-header">
          <div className="brand-icon">
            <Briefcase />
          </div>
          <h1 className="title">Welcome to JobPortal</h1>
          <p className="subtitle">Choose how you want to continue</p>
        </div>

        {/* Cards */}
        <div className="role-grid">

          {/* Candidate */}
          <Link to="/register/candidate" className="role-card">
            <div className="role-content">

              <div className="role-icon candidate">
                <UserCircle />
              </div>

              <h2>I'm a Candidate</h2>

              <p className="desc">
                Looking for your dream job? Explore thousands of opportunities from top companies.
              </p>

              <div className="features">
                <div><CheckCircle /> Browse job listings</div>
                <div><CheckCircle /> Apply to multiple jobs</div>
                <div><CheckCircle /> Track your applications</div>
                <div><CheckCircle /> Build your profile</div>
              </div>

              <div className="btn candidate">Register as Candidate</div>

            </div>
          </Link>

          {/* Company */}
          <Link to="/register/company" className="role-card">
            <div className="role-content">

              <div className="role-icon company">
                <Building />
              </div>

              <h2>I'm a Company</h2>

              <p className="desc">
                Find the best talent for your company. Post jobs and manage applications efficiently.
              </p>

              <div className="features">
                <div><CheckCircle /> Post unlimited jobs</div>
                <div><CheckCircle /> Access candidate database</div>
                <div><CheckCircle /> Manage applications</div>
                <div><CheckCircle /> Analytics dashboard</div>
              </div>

              <div className="btn company">Register as Company</div>

            </div>
          </Link>

        </div>

        {/* Login */}
        <div className="login">
          Already have an account? <Link to="/login">Login</Link>
        </div>

      </div>
    </div>
  );
}