import React from 'react';
import './Support.css';

function ContactSection() {
    const contactMethods = [
        {
            icon: "📞",
            title: "Phone Support",
            description: "Speak directly with our support team",
            details: [
                "Toll-free: 1800-419-4255",
                "Mobile: +91-80-4040-2020",
                "Hours: 9:00 AM - 6:00 PM (Mon-Fri)"
            ],
            action: "Call Now",
            actionType: "phone"
        },
        {
            icon: "💬",
            title: "Live Chat",
            description: "Get instant help with our chat support",
            details: [
                "Available 24/7",
                "Average response: < 2 minutes",
                "Multi-language support"
            ],
            action: "Start Chat",
            actionType: "chat"
        },
        {
            icon: "📧",
            title: "Email Support",
            description: "Send us a detailed message",
            details: [
                "support@stocktrading.com",
                "Response within 2 hours",
                "Detailed issue tracking"
            ],
            action: "Send Email",
            actionType: "email"
        },
        {
            icon: "🎫",
            title: "Support Ticket",
            description: "Create a formal support request",
            details: [
                "Priority-based handling",
                "Full issue tracking",
                "Follow-up notifications"
            ],
            action: "Create Ticket",
            actionType: "ticket"
        }
    ];

    const handleContactAction = (type) => {
        switch (type) {
            case 'phone':
                window.open('tel:+918040402020');
                break;
            case 'chat':
                // In a real app, this would open a chat widget
                alert('Live chat feature coming soon!');
                break;
            case 'email':
                window.open('mailto:support@stocktrading.com');
                break;
            case 'ticket':
                // Scroll to the ticket form
                document.getElementById('ticket-form')?.scrollIntoView({ behavior: 'smooth' });
                break;
            default:
                break;
        }
    };

    return (
        <div className="contact-section" id="contact">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Get in Touch</h2>
                    <p className="section-subtitle">
                        Choose the support method that works best for you. We're here to help!
                    </p>
                </div>

                <div className="contact-methods">
                    <div className="row">
                        {contactMethods.map((method, index) => (
                            <div key={index} className="col-12 col-md-6 col-lg-3 mb-4">
                                <div className="contact-card">
                                    <div className="contact-icon">
                                        <span className="icon-emoji">{method.icon}</span>
                                    </div>
                                    <h3 className="contact-title">{method.title}</h3>
                                    <p className="contact-description">{method.description}</p>
                                    <ul className="contact-details">
                                        {method.details.map((detail, detailIndex) => (
                                            <li key={detailIndex}>{detail}</li>
                                        ))}
                                    </ul>
                                    <button
                                        className="contact-action-btn"
                                        onClick={() => handleContactAction(method.actionType)}
                                    >
                                        {method.action}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="additional-info">
                    <div className="row">
                        <div className="col-12 col-md-6">
                            <div className="info-card">
                                <h4>Office Hours</h4>
                                <div className="info-content">
                                    <p><strong>Customer Support:</strong></p>
                                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                    <p>Saturday: 9:00 AM - 2:00 PM</p>
                                    <p>Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="info-card">
                                <h4>Emergency Support</h4>
                                <div className="info-content">
                                    <p><strong>For urgent trading issues:</strong></p>
                                    <p>Call: +91-80-4040-2020</p>
                                    <p>Available 24/7 during market hours</p>
                                    <p>Email: emergency@stocktrading.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactSection;
