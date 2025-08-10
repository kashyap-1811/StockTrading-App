import { Link } from 'react-router-dom';
import React from 'react';

function Benefits() {
    return (
        <div className="container py-5">
            <div className="row align-items-center">
                {/* Left: Ecosystem Image */}
                <div className="col-lg-6 text-center">
                    <img
                        src="images/acop-benefits.svg"
                        alt="Zerodha ecosystem"
                        className="img-fluid mb-3"
                        style={{ height: '200px', width: '100%', objectFit: 'contain' }}
                    />

                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                        Benefits of opening a Zerodha demat account
                    </h2>
                </div>

                {/* Right: Content Section */}
                <div className="col-lg-6 mb-4 mb-lg-0">
                    <div className="mb-4">
                        <h5 className="fw-semibold mb-2">Unbeatable pricing</h5>
                        <p className="text-muted">
                            Simple and intuitive trading platform with an easy-to-understand user interface.
                        </p>
                    </div>

                    <div className="mb-4">
                        <h5 className="fw-semibold mb-2">Best investing experience</h5>
                        <p className="text-muted">
                            Simple and intuitive trading platform with an easy-to-understand user interface.
                        </p>
                    </div>

                    <div className="mb-4">
                        <h5 className="fw-semibold mb-2">No spam or gimmicks</h5>
                        <p className="text-muted">
                            Committed to transparency — no gimmicks, spam, "gamification", or intrusive push notifications.
                        </p>
                    </div>

                    <div>
                        <h5 className="fw-semibold mb-2">The Zerodha universe</h5>
                        <p className="text-muted">
                            More than just an app — gain free access to the entire ecosystem of our partner products.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Benefits;
