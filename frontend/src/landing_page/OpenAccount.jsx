import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OpenAccount() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
        if (location.pathname === '/signup') {
            // Scroll to top if already on /products
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Navigate to /products
            navigate('/signup');
        }
    };

    return (
        <div className='container py-5 mb-3'>
            <div className='row text-center justify-content-center'>
                <h1>Open a Zerodha account</h1>
                <p>
                    Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and F&O trades.
                </p>

                <div className='col-12'>
                    <button 
                        className='btn btn-primary fs-5 py-2 mt-2 d-none d-lg-inline-block'
                        style={{ width: "20%" }}
                        onClick={handleClick}
                    >
                        Sign Up for Free
                    </button>
                    <button 
                        className='btn btn-primary fs-5 py-2 mt-2 d-inline-block d-lg-none'
                        style={{ width: "80%" }}
                        onClick={handleClick}
                    >
                        Sign Up for Free
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OpenAccount;
