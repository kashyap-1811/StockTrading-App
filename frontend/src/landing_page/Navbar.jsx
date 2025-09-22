import React, { useState } from "react";
import { Menu } from "lucide-react";
import {Link} from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const [currentPath, setCurrentPath] = useState(location.pathname);

    return (
        <nav className="navbar">
            <div className="container nav-row">
                <div className="logo">
                    <Link to="/" onClick={() => setCurrentPath('/')}>
                        <img
                            src="./images/logo.svg"
                            alt="Zerodha logo"
                        />
                    </Link>
                </div>

                <ul className="nav-links my-2">
                    <li><Link to="/" className={currentPath === '/' ? "text-primary" : ''} onClick={() => setCurrentPath('/')}>Home</Link></li>
                    <li><Link to="/signup" className={currentPath === '/signup' ? "text-primary" : ''} onClick={() => setCurrentPath('/signup')}>Signup</Link></li>
                    <li><Link to="/about" className={currentPath === '/about' ? "text-primary" : ''} onClick={() => setCurrentPath('/about')}>About</Link></li>
                    <li><Link to="/products" className={currentPath === '/products' ? "text-primary" : ''} onClick={() => setCurrentPath('/products')}>Products</Link></li>
                    <li><Link to="/pricing" className={currentPath === '/pricing' ? "text-primary" : ''} onClick={() => setCurrentPath('/pricing')}>Pricing</Link></li>

                    {/* Menu Icon with Dropdown */}
                    <li
                        className="menu-container"
                        onClick={() => setShowMegaMenu(!showMegaMenu)}
                    >
                        <Menu size={24} />
                        {showMegaMenu && (
                            <div className="mega-menu">
                                {/* Top Section */}
                                <div className="mega-row">
                                    <div className="mega-column">
                                    <a href="http://localhost:3000">
                                        <img src="images/kite-logo.svg" alt="Kite" />
                                        <div>Kite</div>
                                        <span>Trading platform</span>
                                    </a>
                                    </div>
                                    <div className="mega-column">
                                        <img src="images/console-logo.svg" alt="Console" />
                                        <div>Console</div>
                                        <span>Backoffice</span>
                                    </div>
                                    <div className="mega-column">
                                        <img src="images/kite-connect.svg" alt="Kite Connect" />
                                        <div>Kite Connect</div>
                                        <span>Trading APIs</span>
                                    </div>
                                    <div className="mega-column">
                                        <img src="images/coin-logo.svg" alt="Coin" />
                                        <div>Coin</div>
                                        <span>Mutual funds</span>
                                    </div>
                                </div>

                                <div className="mega-links">
                                    <div className="col-2">
                                        <h4>Utilities</h4>
                                        <p>Calculators</p>
                                        <p>Brokerage calculator</p>
                                        <p>Margin calculator</p>
                                        <p>SIP calculator</p>
                                    </div>
                                    <div className="col-2">
                                        <h4>Updates</h4>
                                        <p>Z-Connect blog</p>
                                        <p>Circulars / Bulletin</p>
                                        <p>IPOs</p>
                                        <p>Markets</p>
                                    </div>
                                    <div className="col-4">
                                        <p><strong>Education</strong></p>
                                        <div className="education-wrapper">
                                            <a href="https://zerodha.com/varsity/" className="education-item">
                                                <img src="images/varsity-logo.png" />
                                                <span>Varsity</span>
                                            </a>
                                            <a href="https://tradingqna.com/" className="education-item">
                                                <img src="images/tqna-logo.png" />
                                                <span>Trading Q&amp;A</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
}
