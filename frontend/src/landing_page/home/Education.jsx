import React from "react";

function Education() {
    return (
        <div className="container py-5">
            <div className="row align-items-center">
                {/* Left: Illustration */}
                <div className="col-lg-6 mb-4 mb-lg-0 text-center">
                    <img
                        src="images/education.svg"
                        alt="Varsity illustration"
                        className="img-fluid"
                        style={{ maxHeight: "350px", width: "100%", objectFit: "contain" }}
                    />
                </div>

                {/* Right: Content */}
                <div className="col-lg-6">
                    <h1 className="fw-bold mb-4">Free and open market education</h1>
                    <p className="text-muted">
                        Varsity, the largest online stock market education book in the
                        world, covers everything from the basics to advanced trading
                        strategies.
                    </p>
                    <a
                        href="https://zerodha.com/varsity/"
                        className="text-decoration-none d-inline-block fw-semibold mb-2"
                        target="_blank"
                    >
                        Varsity <span className="ms-1">→</span>
                    </a>

                    <p className="text-muted">
                        TradingQ&A, the most active trading and investment community in India for all your market related queries.
                    </p>
                    <a
                        href="https://zerodha.com/tradingqna/"
                        className="text-decoration-none d-inline-block fw-semibold mb-2"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        TradingQ&A <span className="ms-1">→</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Education;
