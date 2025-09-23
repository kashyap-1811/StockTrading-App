import React, { useState } from 'react';
import './Support.css';

function CreateTicket() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: '',
        priority: 'medium'
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log('Support ticket submitted:', formData);
        setIsSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                email: '',
                subject: '',
                category: 'general',
                message: '',
                priority: 'medium'
            });
        }, 3000);
    };

    if (isSubmitted) {
        return (
            <div className="support-section">
                <div className="container">
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h3>Ticket Submitted Successfully!</h3>
                        <p>We've received your support request and will get back to you within 2 hours.</p>
                        <p className="ticket-id">Ticket ID: #ST-{Date.now().toString().slice(-6)}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="support-section">
            <div className="container">
                <div className="row">
                    <div className="col-12 col-lg-8 mx-auto">
                        <div className="support-card">
                            <h2 className="section-title">Create Support Ticket</h2>
                            <p className="section-subtitle">
                                Can't find what you're looking for? Send us a message and we'll help you out.
                            </p>
                            
                            <form onSubmit={handleSubmit} className="support-form">
                                <div className="row">
                                    <div className="col-12 col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="name">Full Name *</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="form-control"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="email">Email Address *</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="form-control"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-12 col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="category">Category *</label>
                                            <select
                                                id="category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                required
                                                className="form-control"
                                            >
                                                <option value="general">General Inquiry</option>
                                                <option value="technical">Technical Issue</option>
                                                <option value="billing">Billing & Payments</option>
                                                <option value="account">Account Management</option>
                                                <option value="trading">Trading Support</option>
                                                <option value="feature">Feature Request</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="priority">Priority</label>
                                            <select
                                                id="priority"
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Subject *</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control"
                                        placeholder="Brief description of your issue"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Message *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows="6"
                                        className="form-control"
                                        placeholder="Please provide detailed information about your issue..."
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">
                                        Submit Ticket
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setFormData({
                                        name: '',
                                        email: '',
                                        subject: '',
                                        category: 'general',
                                        message: '',
                                        priority: 'medium'
                                    })}>
                                        Clear Form
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateTicket;