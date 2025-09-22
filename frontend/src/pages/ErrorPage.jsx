import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import './ErrorPage.css';

const ErrorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get('code') || '500';
  const errorMessage = searchParams.get('message') || 'Something went wrong';
  const errorTitle = searchParams.get('title') || 'Oops! Something went wrong';

  const getErrorImage = () => {
    switch (errorCode) {
      case '404':
        return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center';
      case '403':
        return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center';
      case '500':
        return 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=400&h=300&fit=crop&crop=center';
      default:
        return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center';
    }
  };

  const getErrorSuggestions = () => {
    switch (errorCode) {
      case '404':
        return [
          'Check if the URL is correct',
          'The page might have been moved or deleted',
          'Try using the navigation menu'
        ];
      case '403':
        return [
          'You might not have permission to access this page',
          'Try logging in with a different account',
          'Contact support if you believe this is an error'
        ];
      case '500':
        return [
          'This is a server error on our end',
          'Try refreshing the page',
          'If the problem persists, contact support'
        ];
      default:
        return [
          'Try refreshing the page',
          'Check your internet connection',
          'Contact support if the problem continues'
        ];
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          {/* Error Image */}
          <div className="error-image-container">
            <img 
              src={getErrorImage()} 
              alt="Error illustration" 
              className="error-image"
            />
          </div>

          {/* Error Details */}
          <div className="error-details">
            <div className="error-icon">
              <AlertTriangle size={48} />
            </div>
            
            <h1 className="error-title">{errorTitle}</h1>
            
            <div className="error-code">
              Error {errorCode}
            </div>
            
            <p className="error-message">
              {errorMessage}
            </p>

            {/* Error Suggestions */}
            <div className="error-suggestions">
              <h3>What you can do:</h3>
              <ul>
                {getErrorSuggestions().map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="error-actions">
              <button 
                className="error-btn error-btn-primary"
                onClick={handleGoHome}
              >
                <Home size={20} />
                Go Home
              </button>
              
              <button 
                className="error-btn error-btn-secondary"
                onClick={handleGoBack}
              >
                <ArrowLeft size={20} />
                Go Back
              </button>
              
              <button 
                className="error-btn error-btn-outline"
                onClick={handleRefresh}
              >
                <RefreshCw size={20} />
                Refresh
              </button>
            </div>

            {/* Support Link */}
            <div className="error-support">
              <p>
                Still having trouble? 
                <a href="/support" className="support-link">
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
