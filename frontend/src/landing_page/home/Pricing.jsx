import React from 'react';
import './Pricing.css';

function Pricing() {
    return (
        <div className="container py-3">
            <div className="row">
                {/* Left side */}
                <div className="col-12 col-lg-5 mb-4 mb-lg-0">
                    <h1 className="fw-bold mb-3">Unbeatable pricing</h1>
                    <p className="text-muted mb-4">
                        We pioneered the concept of discount broking and price transparency in India.
                        Flat fees and no hidden charges.
                    </p>
                    <a href="#" className="text-decoration-none fw-semibold">
                        See pricing <span className="ms-1">→</span>
                    </a>
                </div>

                {/* Right side: 3 pricing blocks */}
                <div className="col-12 col-lg-7">
                    <div className="row">
                        {/* Block 1 - closer to Block 2 */}
                        <div className="col-12 col-lg-4 d-flex align-items-center mb-4 mb-lg-0 pe-lg-1">
                            <img
                                src="images/pricing0.svg"
                                alt="₹0"
                                style={{ height: '100px' }}
                            />
                            <div className="ms-2 text-muted pricing-text">
                                <div>Free account</div>
                                <div>opening</div>
                            </div>
                        </div>

                        {/* Block 2 */}
                        <div className="col-12 col-lg-4 d-flex align-items-center mb-4 mb-lg-0 px-lg-1">
                            <img
                                src="images/pricing0.svg"
                                alt="₹0"
                                style={{ height: '100px' }}
                            />
                            <div className="ms-2 text-muted pricing-text">
                                <div>Free equity delivery</div>
                                <div>and direct mutual funds</div>
                            </div>
                        </div>

                        {/* Block 3 - more space from Block 2 */}
                        <div className="col-12 col-lg-4 d-flex align-items-center mb-4 mb-lg-0 ps-lg-3">
                            <img
                                src="images/pricing20.svg"
                                alt="₹20"
                                style={{ height: '100px' }}
                            />
                            <div className="ms-2 text-muted pricing-text">
                                <div>Intraday and</div>
                                <div>F&amp;O</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Pricing;
