import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createErrorConfig } from '../../utils/errorHandler';
import './Error.css';

const ErrorPage = ({ 
  type = '404', 
  title, 
  message, 
  showRetry = false, 
  onRetry,
  showHome = true,
  customImage = null 
}) => {
  const navigate = useNavigate();

  // Get error configuration from errorHandler
  const config = createErrorConfig({ type }, {
    title,
    message,
    image: customImage,
    showRetry,
    showHome,
    onRetry
  });

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const getErrorIllustration = (errorType) => {
    if (errorType === '404') {
      return (
        <div className="illustration-404">
          <div className="green-circle">
            <div className="sad-envelope">
              <div className="envelope-body">📧</div>
              <div className="sad-face">:(</div>
            </div>
            <div className="ground-patch"></div>
          </div>
          <div className="cloud cloud-1">☁️</div>
          <div className="cloud cloud-2">☁️</div>
          <div className="scattered-envelopes">
            <div className="envelope-small envelope-1">📧</div>
            <div className="envelope-small envelope-2">📧</div>
            <div className="envelope-small envelope-3">📧</div>
          </div>
        </div>
      );
    }
    
    // For other error types, show a simple centered illustration
    return (
      <div className="simple-illustration">
        <div className="error-icon-large">{config.image}</div>
      </div>
    );
  };

  return (
    <div className="error-page-container">
      <div className="error-content">
        <div className="error-left">
          <div className="error-text">
            <h1 className="error-title">{config.title}</h1>
            <p className="error-message">{config.message}</p>
            
            <div className="possible-reasons">
              <h3>Possible Reasons:</h3>
              <ul>
                {config.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="error-actions">
            {showHome && (
              <button 
                className="error-btn primary-btn"
                onClick={handleGoHome}
              >
                Go Home
              </button>
            )}
            
            {showRetry && (
              <button 
                className="error-btn secondary-btn"
                onClick={handleRetry}
              >
                Try Again
              </button>
            )}
          </div>
        </div>

        <div className="error-right">
          <div className="error-illustration">
            {getErrorIllustration(type)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
