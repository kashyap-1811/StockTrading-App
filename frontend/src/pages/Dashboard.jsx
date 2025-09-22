import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/signup');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/signup');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signup');
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3>Dashboard</h3>
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                {user.profilePicture && (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="rounded-circle me-3"
                    style={{ width: '60px', height: '60px' }}
                  />
                )}
                <div>
                  <h5>Welcome, {user.name}!</h5>
                  <p className="text-muted mb-0">Email: {user.email}</p>
                </div>
              </div>
              <p>This is your trading dashboard. More features coming soon!</p>
              <div className="alert alert-info">
                <strong>Google OAuth Integration Complete!</strong><br/>
                You have successfully signed in with Google. The system has created your account and you're now authenticated.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
