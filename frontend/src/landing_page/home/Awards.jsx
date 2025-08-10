import React from 'react';

function Awards() {
    return (
        <div className="container py-5">
            <div className="row align-items-center mb-5">
                {/* Left: Award Image and Heading */}
                <div className="col-md-6 text-center text-md-start d-flex justify-content-center">
                    <img
                        src="images/largestBroker.svg"
                        alt="broker image"
                        className="img-fluid mb-4"
                        style={{ maxHeight: '350px' }}
                    />
                </div>

                {/* Right: List of Offerings */}
                <div className="col-md-6">
                    <h1 className="fw-bold mb-3">
                        India's largest stock broker
                    </h1>
                    <p className="text-muted">
                        1.6+ crore customers place their trust in Zerodha with ~ ₹6 lakh crores of investments.
                    </p>

                    <h3 className="fw-semibold mb-4">Everything you need to invest</h3>
                    <div className="row">
                        <div className="col-sm-6">
                            <ul className="ms-3" style={{ listStyleType: 'disc' }}>
                                <li className="mb-3">Futures and Options</li>
                                <li className="mb-3">Commodity Derivatives</li>
                                <li className="mb-3">Currency Derivatives</li>
                            </ul>
                        </div>
                        <div className="col-sm-6">
                            <ul className="ms-3" style={{ listStyleType: 'disc' }}>
                                <li className="mb-3">Stocks & IPOs</li>
                                <li className="mb-3">Direct Mutual Funds</li>
                                <li className="mb-3">Bonds & Govt. Securities</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>

            {/* Press Logos */}
            <div className="text-center mt-5">
                <img
                    src="images/pressLogos.png"
                    alt="Press logos"
                    className="img-fluid"
                    style={{ maxWidth: '90%', height: 'auto' }}
                />
            </div>
        </div>
    );
}

export default Awards;
