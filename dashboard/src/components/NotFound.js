import React from 'react';
import ErrorPage from './Error/Error';

function NotFound() {
    return ( 
        <ErrorPage 
            type="404"
            title="So Sorry!"
            message="The page you are looking for cannot be found"
            showHome={true}
            showRetry={false}
        />
    );
}

export default NotFound;