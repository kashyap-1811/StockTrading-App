import React from "react";
import { Link } from "react-router-dom";

function Kite() {
    return (
        <div className="container">
            <div className="row justify-content-center align-items-center g-0">

                {/* Left: Image */}
                <div className="col-lg-6 col-md-6 text-center pe-md-3">
                    <img
                        src="images/kite.png"
                        alt="Kite Trading App"
                        className="img-fluid"
                        style={{ maxHeight: "600px", objectFit: "contain" }}
                    />
                </div>

                {/* Right: Text Content */}
                <div className="col-lg-4 text-md-start text-center">
                    <div style={{ maxWidth: '350px', margin: '0 auto' }}>
                        <h1 className="fw-bold mb-3">Kite</h1>

                        <p className="text-muted fs-6 mb-4">
                            Our ultra-fast flagship trading platform with streaming market data, advanced charts,
                            an elegant UI, and more. Enjoy the Kite experience seamlessly on your Android and iOS devices.
                        </p>

                        {/* Links */}
                        <div className="d-flex justify-content-center justify-content-md-start flex-wrap gap-4 mb-3">
                            <Link
                                to="https://kite-demo.zerodha.com/dashboard"
                                className="text-decoration-none fw-semibold"
                            >
                                Try Demo<span className="ms-1">→</span>
                            </Link>

                            <a
                                href="https://zerodha.com/products/kite"
                                className="text-decoration-none fw-semibold"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Learn More<span className="ms-1">→</span>
                            </a>
                        </div>

                        {/* Download Badges */}
                        <div className="d-flex justify-content-center justify-content-md-start gap-3 flex-wrap mt-3">
                            <img
                                src="images/googlePlayBadge.svg"
                                alt="Download on Google Play"
                                className="img-fluid"
                                style={{ maxWidth: "160px", height: "auto" }}
                            />
                            <img
                                src="images/appstoreBadge.svg"
                                alt="Download on App Store"
                                className="img-fluid"
                                style={{ maxWidth: "160px", height: "auto" }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Kite;
