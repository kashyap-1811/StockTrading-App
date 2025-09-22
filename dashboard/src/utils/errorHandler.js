// Error handling utility for consistent error management

export const ErrorTypes = {
  NOT_FOUND: '404',
  SERVER_ERROR: '500',
  ACCESS_DENIED: '403',
  NETWORK_ERROR: 'network',
  TIMEOUT: 'timeout',
  MAINTENANCE: 'maintenance',
  VALIDATION: 'validation',
  AUTHENTICATION: 'auth'
};

export const getErrorMessage = (error, defaultMessage = 'An unexpected error occurred') => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return defaultMessage;
};

export const getErrorType = (error) => {
  if (!error) return 'default';
  
  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return ErrorTypes.NETWORK_ERROR;
  }
  
  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ErrorTypes.TIMEOUT;
  }
  
  // HTTP status codes
  if (error.response?.status) {
    switch (error.response.status) {
      case 404:
        return ErrorTypes.NOT_FOUND;
      case 403:
        return ErrorTypes.ACCESS_DENIED;
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorTypes.SERVER_ERROR;
      case 401:
        return ErrorTypes.AUTHENTICATION;
      default:
        return 'default';
    }
  }
  
  return 'default';
};

export const createErrorConfig = (error, customConfig = {}) => {
  const type = getErrorType(error);
  const message = getErrorMessage(error);
  
  const defaultConfigs = {
    [ErrorTypes.NOT_FOUND]: {
      type: ErrorTypes.NOT_FOUND,
      title: 'So Sorry!',
      message: 'The page you are looking for cannot be found',
      image: '📧',
      reasons: [
        'The address may have been typed incorrectly;',
        'It may be a broken or outdated link.'
      ],
      showRetry: false,
      showHome: true
    },
    [ErrorTypes.SERVER_ERROR]: {
      type: ErrorTypes.SERVER_ERROR,
      title: 'Server Error',
      message: 'Something went wrong on our end. We\'re working to fix it.',
      image: '🖥️',
      reasons: [
        'Our servers are experiencing technical difficulties;',
        'A temporary issue occurred while processing your request.'
      ],
      showRetry: true,
      showHome: true
    },
    [ErrorTypes.ACCESS_DENIED]: {
      type: ErrorTypes.ACCESS_DENIED,
      title: 'Access Denied',
      message: 'You don\'t have permission to access this resource.',
      image: '🔒',
      reasons: [
        'You may not have permission to access this resource;',
        'Your session may have expired.'
      ],
      showRetry: false,
      showHome: true
    },
    [ErrorTypes.NETWORK_ERROR]: {
      type: ErrorTypes.NETWORK_ERROR,
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      image: '📡',
      reasons: [
        'Your internet connection may be unstable;',
        'Our servers may be temporarily unavailable.'
      ],
      showRetry: true,
      showHome: true
    },
    [ErrorTypes.TIMEOUT]: {
      type: ErrorTypes.TIMEOUT,
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      image: '⏱️',
      reasons: [
        'The request took longer than expected to complete;',
        'Our servers may be experiencing high traffic.'
      ],
      showRetry: true,
      showHome: true
    },
    [ErrorTypes.MAINTENANCE]: {
      type: ErrorTypes.MAINTENANCE,
      title: 'Under Maintenance',
      message: 'We\'re currently performing scheduled maintenance. We\'ll be back soon!',
      image: '🔧',
      reasons: [
        'We are performing scheduled system maintenance;',
        'This is a temporary interruption of service.'
      ],
      showRetry: true,
      showHome: true
    },
    [ErrorTypes.AUTHENTICATION]: {
      type: ErrorTypes.AUTHENTICATION,
      title: 'Authentication Required',
      message: 'Please log in to access this resource.',
      image: '🔐',
      reasons: [
        'You need to be logged in to access this resource;',
        'Your session may have expired.'
      ],
      showRetry: false,
      showHome: true
    },
    default: {
      type: 'default',
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again later.',
      image: '⚠️',
      reasons: [
        'An unexpected error occurred;',
        'Please try again later.'
      ],
      showRetry: true,
      showHome: true
    }
  };
  
  const config = defaultConfigs[type] || defaultConfigs.default;
  
  return {
    ...config,
    message: customConfig.message || message || config.message,
    title: customConfig.title || config.title,
    image: customConfig.image || config.image,
    reasons: customConfig.reasons || config.reasons,
    showRetry: customConfig.showRetry !== undefined ? customConfig.showRetry : config.showRetry,
    showHome: customConfig.showHome !== undefined ? customConfig.showHome : config.showHome,
    onRetry: customConfig.onRetry || config.onRetry
  };
};
