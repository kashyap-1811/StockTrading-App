import React from 'react';

function KiteConnect() {
    return (
        <div className="container">
            <div className="row justify-content-center align-items-center g-0">
                
                {/* Left: Text Content */}
                <div className="col-lg-4 text-md-start text-center">
                    <div style={{ maxWidth: '350px', margin: '0 auto' }}>
                        <h1 className="fw-bold mb-3">Kite Connect API</h1>

                        <p className="text-muted fs-6 mb-4">
                            Build powerful trading platforms and experiences with our super simple HTTP/JSON APIs. If you are a startup, build your investment app and showcase it to our clientbase.
                        </p>

                        <a
                            href="https://zerodha.com/products/api/"
                            className="text-decoration-none fw-semibold"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Kite Connect<span className="ms-1">→</span>
                        </a>
                    </div>
                </div>

                {/* Right: Image */}
                <div className="col-lg-6 col-md-6 text-center pe-md-3">
                    <img
                        src="images/console.png"
                        alt="Console"
                        className="img-fluid"
                        style={{ maxHeight: '600px', objectFit: 'contain' }}
                    />
                </div>
            </div>
        </div>
    );
}

export default KiteConnect;
