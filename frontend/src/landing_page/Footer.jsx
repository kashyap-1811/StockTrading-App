import React from 'react';
import './Footer.css'; // Optional: For any custom styles

export default function Footer() {
  return (
    <footer id="footer" className="bg-light pt-5">
      <div className="container">
        <div className="row mb-4">
          {/* Left Column */}
          <div className="col-md-3 mb-4">
            <img src="images/logo.svg" alt="Zerodha Logo" className="mb-3 main-logo" />
            <p className="text-muted mb-1">© 2010 - 2025, Zerodha Broking Ltd.</p>
            <p className="text-muted">All rights reserved.</p>

            <ul className="list-inline mt-3">
              <li className="list-inline-item">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <img src="images/x-twitter.svg" alt="Twitter" className="logos"/>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://facebook.com/zerodha.social"  target="_blank" rel="noopener noreferrer">
                  <img src="images/facebook-logo.svg" alt="Facebook" className="logos"/>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://instagram.com/zerodhaonline/" target="_blank" rel="noopener noreferrer">
                  <img src="images/instagram-logo.svg" alt="Instagram" className="logos"/>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://linkedin.com/company/zerodha" target="_blank" rel="noopener noreferrer">
                  <img src="images/linkedin-logo.svg" alt="LinkedIn" className="logos"/>
                </a>
              </li>
            </ul>

            <hr />

            <ul className="list-inline">
              <li className="list-inline-item">
                <a href="https://www.youtube.com/@zerodhaonline" target="_blank" rel="noopener noreferrer">
                  <img src="images/youtube-logo.svg" alt="YouTube" className="logos" />
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://whatsapp.com/channel/0029Va8tzF0EquiIIb9j791g" target="_blank" rel="noopener noreferrer">
                  <img src="images/whatsapp-logo.svg" alt="WhatsApp" className="logos" />
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://t.me/zerodhain" target="_blank" rel="noopener noreferrer">
                  <img src="images/telegram-logo.svg" alt="Telegram" className="logos" />
                </a>
              </li>
            </ul>
          </div>

          {/* Right Column */}
          <div className="col-md-9">
            <div className="row">
              {/* Account */}
              <div className="col-md-3">
                <h6 className="text-dark fw-bold">Account</h6>
                <ul className="list-unstyled">
                  <li><a href="https://zerodha.com/open-account/">Open demat account</a></li>
                  <li><a href="https://zerodha.com/open-account/minor/">Minor demat account</a></li>
                  <li><a href="https://zerodha.com/open-account/nri/">NRI demat account</a></li>
                  <li><a href="https://zerodha.com/commodities/">Commodity</a></li>
                  <li><a href="https://zerodha.com/dematerialise/">Dematerialisation</a></li>
                  <li><a href="https://zerodha.com/fund-transfer/">Fund transfer</a></li>
                  <li><a href="https://zerodha.com/mtf/">MTF</a></li>
                  <li><a href="https://zerodha.com/refer/">Referral program</a></li>
                </ul>
              </div>

              {/* Support */}
              <div className="col-md-3">
                <h6 className="text-dark fw-bold">Support</h6>
                <ul className="list-unstyled">
                  <li><a href="https://zerodha.com/contact/">Contact us</a></li>
                  <li><a href="https://support.zerodha.com">Support portal</a></li>
                  <li><a href="https://support.zerodha.com/category/your-zerodha-account/your-profile/ticket-creation/articles/how-do-i-create-a-ticket-at-zerodha" target="_blank">How to file a complaint?</a></li>
                  <li><a href="https://support.zerodha.com/category/your-zerodha-account/your-profile/ticket-creation/articles/track-complaints-or-tickets" target="_blank">Status of complaints</a></li>
                  <li><a href="https://zerodha.com/marketintel/bulletin/">Bulletin</a></li>
                  <li><a href="https://zerodha.com/marketintel/circulars/">Circular</a></li>
                  <li><a href="https://zerodha.com/z-connect/">Z-Connect blog</a></li>
                  <li><a href="https://zerodha.com/resources/">Downloads</a></li>
                </ul>
              </div>

              {/* Company */}
              <div className="col-md-3">
                <h6 className="text-dark fw-bold">Company</h6>
                <ul className="list-unstyled">
                  <li><a href="https://zerodha.com/about/">About</a></li>
                  <li><a href="https://zerodha.com/about/philosophy/">Philosophy</a></li>
                  <li><a href="https://zerodha.com/media/">Press & media</a></li>
                  <li><a href="https://careers.zerodha.com/">Careers</a></li>
                  <li><a href="https://zerodha.com/cares/">Zerodha Cares (CSR)</a></li>
                  <li><a href="https://zerodha.tech/">Zerodha.tech</a></li>
                  <li><a href="https://zerodha.com/open-source/">Open source</a></li>
                </ul>
              </div>

              {/* Quick Links */}
              <div className="col-md-3">
                <h6 className="text-dark fw-bold">Quick links</h6>
                <ul className="list-unstyled">
                  <li><a href="https://zerodha.com/ipo/">Upcoming IPOs</a></li>
                  <li><a href="https://zerodha.com/charges/">Brokerage charges</a></li>
                  <li><a href="https://zerodha.com/marketintel/holiday-calendar/">Market holidays</a></li>
                  <li><a href="https://zerodha.com/markets/calendar/">Economic calendar</a></li>
                  <li><a href="https://zerodha.com/calculators/">Calculators</a></li>
                  <li><a href="https://zerodha.com/markets/stocks/">Markets</a></li>
                  <li><a href="https://zerodha.com/markets/sector/">Sectors</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Smallprint */}
        <div className="row">
          <div className="col-12">
            <div className="text-muted small">
              <p>
                Zerodha Broking Ltd.: Member of NSE, BSE & MCX – SEBI Reg. no.: INZ000031633.
                Depository services: SEBI Reg. no.: IN-DP-431-2019. Commodity Trading through Zerodha Commodities Pvt. Ltd. – SEBI Reg. no.: INZ000038238.
              </p>
              <p>
                Registered Address: #153/154, 4th Cross, Dollars Colony, J.P Nagar 4th Phase, Bengaluru - 560078, Karnataka.
              </p>
              <p>
                For complaints email: <a href="mailto:support@zerodha.com">support@zerodha.com</a>
              </p>
              <p>
                Read: <a href="https://scores.sebi.gov.in/" target="_blank" rel="noreferrer">SEBI SCORES</a> |
                <a href="https://smartodr.in/" target="_blank" rel="noreferrer"> Smart ODR</a> |
                <a href="https://zerodha.com/disclosure/">Disclosures</a>
              </p>
              <p>Investments in securities market are subject to market risks. Read all related documents carefully before investing.</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-4">
          <ul className="list-inline small">
            <li className="list-inline-item"><a href="https://nseindia.com">NSE</a></li>
            <li className="list-inline-item"><a href="https://www.bseindia.com/">BSE</a></li>
            <li className="list-inline-item"><a href="https://www.mcxindia.com/">MCX</a></li>
            <li className="list-inline-item"><a href="https://zerodha.com/terms-and-conditions/">Terms & conditions</a></li>
            <li className="list-inline-item"><a href="https://zerodha.com/policies-and-procedures/">Policies & procedures</a></li>
            <li className="list-inline-item"><a href="https://zerodha.com/privacy-policy/">Privacy policy</a></li>
            <li className="list-inline-item"><a href="https://zerodha.com/disclosure/">Disclosure</a></li>
            <li className="list-inline-item"><a href="https://zerodha.com/investor-attention/">Investor's attention</a></li>
            <li className="list-inline-item"><a href="https://zerodha.com/tos/investor-charter/">Investor charter</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
