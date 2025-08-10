import React from "react";
import { Link } from "react-router-dom";

function Varsity() {
    return (
        <div className="container">
            <div className="row justify-content-center align-items-center g-0">

                {/* Left: Image */}
                <div className="col-lg-6 col-md-6 text-center pe-md-3">
                    <img
                        src="images/varsity.png"
                        alt="varsity Trading App"
                        className="img-fluid"
                        style={{ maxHeight: "600px", objectFit: "contain" }}
                    />
                </div>

                {/* Right: Text Content */}
                <div className="col-lg-4 text-md-start text-center">
                    <div style={{ maxWidth: '350px', margin: '0 auto' }}>
                        <h1 className="fw-bold mb-3">Varsity</h1>

                        <p className="text-muted fs-6 mb-4">
                            An easy to grasp, collection of stock market lessons with in-depth coverage and illustrations. Content is broken down into bite-size cards to help you learn on the go.
                        </p>

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

                <div className="container-fluid py-5 hero-content">
                <div className="row">
                    <div className="col-12 text-center">
                        <p className="hero-subtitle mt-2 mb-5">
                            Want to know more about our technology stack? Check out the <a href="https://zerodha.tech/">Zerodha.tech</a> blog.
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
        </div>
    );
}

export default Varsity;
