import React from 'react';

function Hero() {
    return (
        <div className="container-fluid py-5 hero-content">
            <div className="row">
                <div className="col-12 text-center">
                    <h1 className="hero-main-title mb-2">
                        Zerodha Products
                    </h1>
                    <p className="hero-subtitle mt-2 mb-5">
                        Sleek, modern, and intuitive trading platforms <br />
                        Check out our <a href="https://zerodha.com/investments" className='text-decoration-none'>investment offerings →</a>
                    </p>
                   
                    <hr
                style={{
                    marginLeft: "7rem",
                    marginRight: "7rem",
                    borderTop: "1px solid #666"
                }}
            />
                </div>
            </div>
        </div>
    );
}

export default Hero;
