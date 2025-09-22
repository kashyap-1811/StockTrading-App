import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, ArrowLeft, UserPlus } from 'lucide-react';
import './ErrorPage.css';

const AuthError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/signup');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [navigate]);

  const message = searchParams.get('message') || 'Authentication failed';
  const errorImage = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center';

  const handleGoToSignup = () => {
    navigate('/signup');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          {/* Error Image */}
          <div className="error-image-container">
            <img 
              src={errorImage} 
              alt="Authentication error" 
              className="error-image"
            />
          </div>

          {/* Error Details */}
          <div className="error-details">
            <div className="error-icon">
              <AlertTriangle size={48} />
            </div>
            
            <h1 className="error-title">Authentication Failed</h1>
            
            <div className="error-code">
              Auth Error
            </div>
            
            <p className="error-message">
              {message}
            </p>

            {/* Error Suggestions */}
            <div className="error-suggestions">
              <h3>What you can do:</h3>
              <ul>
                <li>Check your internet connection</li>
                <li>Try signing in again</li>
                <li>Make sure you're using the correct account</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="error-actions">
              <button 
                className="error-btn error-btn-primary"
                onClick={handleGoToSignup}
              >
                <UserPlus size={20} />
                Try Again
              </button>
              
              <button 
                className="error-btn error-btn-secondary"
                onClick={handleGoHome}
              >
                <Home size={20} />
                Go Home
              </button>
              
              <button 
                className="error-btn error-btn-outline"
                onClick={handleRetry}
              >
                <RefreshCw size={20} />
                Retry
              </button>
            </div>

            {/* Auto Redirect Notice */}
            <div className="error-support">
              <p>
                Automatically redirecting to signup in <strong>{countdown}</strong> seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
