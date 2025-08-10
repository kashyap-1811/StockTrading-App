import React from "react";
import { Link } from "react-router-dom";

function Coin() {
    return (
        <div className="container">
            <div className="row justify-content-center align-items-center g-0">

                {/* Left: Image */}
                <div className="col-lg-6 col-md-6 text-center pe-md-3">
                    <img
                        src="images/coin.png"
                        alt="Coin App"
                        className="img-fluid"
                        style={{ maxHeight: "600px", objectFit: "contain" }}
                    />
                </div>

                {/* Right: Text Content */}
                <div className="col-lg-4 text-md-start text-center">
                    <div style={{ maxWidth: '350px', margin: '0 auto' }}>
                        <h1 className="fw-bold mb-3">Coin</h1>

                        <p className="text-muted fs-6 mb-4">
                            Buy direct mutual funds online, commission-free, delivered directly to your Demat account. Enjoy the investment experience on your Android and iOS devices.
                        </p>

                        {/* Links */}
                        <div className="d-flex justify-content-center justify-content-md-start flex-wrap gap-4 mb-3">
                            <Link
                                to="https://kite-demo.zerodha.com/dashboard"
                                className="text-decoration-none fw-semibold"
                            >
                                Coin<span className="ms-1">→</span>
                            </Link>
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

export default Coin;
