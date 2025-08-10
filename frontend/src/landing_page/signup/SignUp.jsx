import React from 'react';
import Hero from './Hero';
import Demat from './Demat'; 
import Benefits from './Benefits';
import OpenAccount from '../OpenAccount';

function SignUp() {
    return (
        <>
            <Hero />
            <Demat />
            <Benefits />
            <OpenAccount />
        </>
    );
}

export default SignUp;