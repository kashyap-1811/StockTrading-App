import React from 'react';

function Hero() {
    return ( 
        <div className='container py-5 mb-3'>
            <div className='row text-center justify-content-center'>
                <div className='col-12'>
                    <img 
                        src="images/homeHero.png" 
                        alt="Hero image" 
                        className='img-fluid mb-3' 
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                </div>

                <div className='col-12'>
                    <h1 className='mt-4'>Invest in Everything</h1>
                    <p className='px-3'>
                        Online platform to invest in stocks, derivatives, mutual funds, ETFs, bonds, and more.
                    </p>
                </div>

                <div className='col-12'>
                    <button 
                        className='btn btn-primary fs-5 py-2 mt-2 d-none d-lg-inline-block'
                        style={{ width: "20%" }}
                        onClick={() => window.location.href = '/signup'}
                    >
                        Sign Up for Free
                    </button>
                    <button 
                        className='btn btn-primary fs-5 py-2 mt-2 d-inline-block d-lg-none'
                        style={{ width: "80%" }}
                        onClick={() => window.location.href = '/signup'}
                    >
                        Sign Up for Free
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Hero;
