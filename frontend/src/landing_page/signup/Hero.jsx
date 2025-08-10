import { useState } from "react"
import { ArrowRight, Github, User } from "lucide-react"
import { Link } from "react-router-dom"
import "./Hero.css"

export default function Hero() {
  const [formData, setFormData] = useState({
    mobile: "",
  })
  const [focusedField, setFocusedField] = useState(null)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const particles = []
  for (let i = 0; i < 15; i++) {
    particles.push({
      id: i,
      left: Math.random() * 100 + "%",
      top: Math.random() * 100 + "%",
      delay: Math.random() * 2 + "s",
      duration: 3 + Math.random() * 4 + "s",
    })
  }

  return (
    <div className="hero-container">
      {/* Background Animations */}
      <div className="bg-animations">
        <div className="pulse-bg pulse-bg-1" />
        <div className="pulse-bg pulse-bg-2" />
        <div className="pulse-bg pulse-bg-3" />
      </div>

      {/* Floating particles */}
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="container-fluid hero-content">
        {/* Title Section */}
        <div className="row">
          <div className="col-12">
            <div className="hero-title-section text-center mb-5">
              <h1 className="hero-main-title">
                Open a free demat and trading account online
              </h1>
              <p className="hero-subtitle">
                Start investing brokerage free and join a community of 1.6+ crore investors and traders
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="row align-items-center">
          {/* Left Side - Image */}
          <div className="col-lg-7 col-md-12 d-flex align-items-center justify-content-center mb-4 mb-lg-0">
            <div className="hero-image-container">
              <img
                src="https://zerodha.com/static/images/landing.png"
                alt="Zerodha Landing"
                className="hero-image"
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="col-lg-5 col-md-12 d-flex align-items-center justify-content-center">
            <div className="signup-card p-4">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="brand-icon">
                  <User size={24} color="white" />
                </div>
                <h2 className="signup-title">
                  Signup now
                </h2>
                <p className="zerodha-text mb-0">
                  Or track your existing application
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="row g-2 mb-4">
                <div className="col-6">
                  <button className="social-btn">
                    <Github size={16} />
                    GitHub
                  </button>
                </div>
                <div className="col-6">
                  <button className="social-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="divider-no-line">
                <span>Or continue with</span>
              </div>

              <form>
                {/* Mobile Number Field */}
                <div className="mb-3">
                  <label className="zerodha-label">Mobile Number</label>
                  <div 
                    className={`mobile-input-group ${focusedField === "mobile" ? "focused" : ""}`}
                  >
                    <div className="mobile-prefix">
                      <img 
                        src="https://flagcdn.com/w20/in.png" 
                        alt="India" 
                        width="20"
                      />
                      +91
                    </div>
                    <input
                      type="tel"
                      className="mobile-input"
                      placeholder="Enter your mobile number"
                      value={formData.mobile}
                      onFocus={() => setFocusedField("mobile")}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => handleInputChange("mobile", e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="zerodha-btn mb-3">
                  Get OTP
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Terms */}
              <p className="zerodha-text text-center mb-3" style={{ fontSize: '12px' }}>
                By proceeding, you agree to the Zerodha{" "}
                <Link to="/terms" className="zerodha-link">
                  terms & privacy policy
                </Link>
              </p>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="zerodha-text mb-0">
                  Already have an account?{" "}
                  <Link to="/signin" className="zerodha-link fw-semibold">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
