import React, { useState } from 'react';
import './Support.css';

function FAQs() {
    const [openFAQ, setOpenFAQ] = useState(null);

    const faqData = [
        {
            category: "Getting Started",
            questions: [
                {
                    question: "How do I open a trading account?",
                    answer: "Opening a trading account is simple! Click on 'Sign Up' in the navigation, fill in your details, complete the KYC process, and you'll be ready to start trading within 24 hours."
                },
                {
                    question: "What documents do I need for account opening?",
                    answer: "You'll need a PAN card, Aadhaar card, bank account details, and a cancelled cheque. For trading in derivatives, you'll also need income proof documents."
                },
                {
                    question: "Is there a minimum balance required?",
                    answer: "No, there's no minimum balance required to open an account. You can start trading with any amount you're comfortable with."
                }
            ]
        },
        {
            category: "Trading & Orders",
            questions: [
                {
                    question: "What types of orders can I place?",
                    answer: "You can place market orders, limit orders, stop-loss orders, and bracket orders. We also support advanced order types like cover orders and bracket orders for better risk management."
                },
                {
                    question: "What are the trading hours?",
                    answer: "Equity trading hours are 9:15 AM to 3:30 PM (Monday to Friday). Pre-market session is from 9:00 AM to 9:15 AM, and post-market session is from 3:40 PM to 4:00 PM."
                },
                {
                    question: "How do I place my first trade?",
                    answer: "After logging into your dashboard, go to the WatchList, search for a stock, click 'Buy', enter the quantity, review the order details, and confirm your purchase."
                }
            ]
        },
        {
            category: "Fees & Charges",
            questions: [
                {
                    question: "What are your brokerage charges?",
                    answer: "We offer zero brokerage on equity delivery trades and direct mutual funds. For intraday and F&O trades, we charge ₹20 per order or 0.03% (whichever is lower)."
                },
                {
                    question: "Are there any hidden charges?",
                    answer: "No hidden charges! We believe in complete transparency. You only pay brokerage, statutory charges (STT, SEBI charges, etc.), and exchange charges as applicable."
                },
                {
                    question: "How do I calculate my total trading cost?",
                    answer: "Use our brokerage calculator available in the utilities section. It will show you the exact breakdown of all charges including brokerage, taxes, and exchange fees."
                }
            ]
        },
        {
            category: "Account Management",
            questions: [
                {
                    question: "How do I add funds to my account?",
                    answer: "You can add funds through UPI, NEFT, RTGS, or IMPS. Go to the Funds section in your dashboard, click 'Add Funds', and follow the instructions."
                },
                {
                    question: "How long does it take to withdraw funds?",
                    answer: "Funds are typically credited to your bank account within 1-2 business days. For amounts above ₹1 lakh, it may take up to 3 business days."
                },
                {
                    question: "Can I change my bank account details?",
                    answer: "Yes, you can update your bank account details by submitting a bank account change request along with a cancelled cheque of the new account."
                }
            ]
        },
        {
            category: "Technical Support",
            questions: [
                {
                    question: "I'm having trouble logging in. What should I do?",
                    answer: "First, ensure you're using the correct user ID and password. If you've forgotten your password, use the 'Forgot Password' option. For persistent issues, contact our support team."
                },
                {
                    question: "The platform is running slow. How can I fix this?",
                    answer: "Try clearing your browser cache, disable browser extensions, or use a different browser. If the issue persists, it might be a server-side issue - contact our technical support."
                },
                {
                    question: "Can I access the platform on mobile?",
                    answer: "Yes! Our platform is fully responsive and works on all devices. You can also download our mobile app for a better trading experience."
                }
            ]
        }
    ];

    const toggleFAQ = (categoryIndex, questionIndex) => {
        const faqKey = `${categoryIndex}-${questionIndex}`;
        setOpenFAQ(openFAQ === faqKey ? null : faqKey);
    };

    return (
        <div className="faqs-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                    <p className="section-subtitle">
                        Find quick answers to the most common questions about our trading platform.
                    </p>
                </div>

                <div className="faqs-container">
                    {faqData.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="faq-category">
                            <h3 className="category-title">{category.category}</h3>
                            <div className="faq-list">
                                {category.questions.map((faq, questionIndex) => {
                                    const faqKey = `${categoryIndex}-${questionIndex}`;
                                    const isOpen = openFAQ === faqKey;
                                    
                                    return (
                                        <div key={questionIndex} className="faq-item">
                                            <button
                                                className={`faq-question ${isOpen ? 'active' : ''}`}
                                                onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                                            >
                                                <span className="question-text">{faq.question}</span>
                                                <span className="faq-icon">
                                                    {isOpen ? '−' : '+'}
                                                </span>
                                            </button>
                                            <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                                                <div className="answer-content">
                                                    {faq.answer}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="faq-footer">
                    <p>Still have questions?</p>
                    <a href="#contact" className="btn btn-outline-primary">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}

export default FAQs;
