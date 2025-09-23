import React from 'react';
import './Support.css';

function Hero() {
    return (
        <div className="support-hero">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-12 col-lg-6">
                        <h1 className="hero-title">How can we help you?</h1>
                        <p className="hero-subtitle">
                            Get instant answers to common questions or reach out to our support team for personalized assistance.
                        </p>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">Support</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">&lt;2min</div>
                                <div className="stat-label">Response Time</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">99.9%</div>
                                <div className="stat-label">Uptime</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6">
                        <div className="hero-illustration">
                            <div className="support-icon">
                                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                    <circle cx="60" cy="60" r="50" fill="#2563eb" fillOpacity="0.1"/>
                                    <path d="M40 50h40v20H40z" fill="#2563eb" fillOpacity="0.2"/>
                                    <path d="M45 55h30v10H45z" fill="#2563eb"/>
                                    <circle cx="50" cy="60" r="3" fill="white"/>
                                    <circle cx="70" cy="60" r="3" fill="white"/>
                                    <path d="M50 70c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="white" strokeWidth="2" fill="none"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hero;