import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Store token and user data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/signup?error=Invalid user data');
      }
    } else {
      navigate('/signup?error=Authentication failed');
    }
  }, [searchParams, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="text-success">Authentication Successful!</h4>
        <p className="text-muted">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
