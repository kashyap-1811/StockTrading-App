import React from 'react';
import Hero from './Hero';
import FAQs from './FAQs';
import CreateTicket from './CreateTicket';
import ContactSection from './ContactSection';

function SupportPage() {
    return ( 
        <div>
            <Hero />
            <FAQs />
            <CreateTicket />
            <ContactSection />
        </div>
     );
}

export default SupportPage;