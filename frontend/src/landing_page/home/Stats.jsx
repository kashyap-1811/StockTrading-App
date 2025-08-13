import { Link } from 'react-router-dom';
import React from 'react';

function Stats() {
    return (
        <div className="container py-5">
            <div className="row align-items-center">
                {/* Left: Content Section */}
                <div className="col-lg-6 mb-4 mb-lg-0">
                    <h1 className="fw-bold mb-4 display-5">Trust with confidence</h1>

                    <div className="mb-4">
                        <h5 className="fw-semibold mb-2">Customer-first always</h5>
                        <p className="text-muted">
                            That’s why 1.6+ crore customers trust Zerodha with ~ ₹6 lakh crores of equity investments,
                            making us India’s largest stock broker; contributing to 15% of all daily retail exchange
                            volumes.
                        </p>
                    </div>

                    <div className="mb-4">
                        <h5 className="fw-semibold mb-2">No spam or gimmicks</h5>
                        <p className="text-muted">
                            No gimmicks, spam, “gamification”, or annoying push notifications. Just high-quality apps
                            you use at your pace, the way you like. Our philosophy is simple.
                        </p>
                    </div>

                    <div className="mb-4">
                        <h5 className="fw-semibold mb-2">The Zerodha universe</h5>
                        <p className="text-muted">
                            Not just an app, but an entire ecosystem. Our investments in 30+ fintech startups offer
                            services tailored to your needs.
                        </p>
                    </div>

                    <div>
                        <h5 className="fw-semibold mb-2">Do better with money</h5>
                        <p className="text-muted">
                            With initiatives like Nudge and Kill Switch, we help you not just transact but make
                            better investing decisions.
                        </p>
                    </div>
                </div>

                {/* Right: Ecosystem Image */}
                <div className="col-lg-6 text-center">
                    <img
                        src="images/ecosystem.png"
                        alt="Zerodha ecosystem"
                        className="img-fluid"
                        style={{ maxHeight: '500px', width: '100%', objectFit: 'contain' }}
                    />

                    <a
                        href="/products"
                        className="text-decoration-none d-inline-block fw-semibold mb-2 my-2 mx-4"
                    >
                        Explore Our Products<span className="ms-1">→</span>
                    </a>

                    <a
                        href="https://zerodha.com/kite/"
                        className="text-decoration-none d-inline-block fw-semibold mb-2"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Try Kite Demo<span className="ms-1">→</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Stats;
