import React from 'react';
import Hero from './Hero';
import Console from './Console';
import Universe from './Universe';
import Coin from './Coin'
import Kite from './Kite';
import KiteConnect from './KiteConnectAPI';
import Varsity from './VarsityMobile';

function ProductPage() {
    return ( 
        <div>
            <Hero />
            <Kite />
            <Console />
            <Coin />
            <KiteConnect />
            <Varsity />
            <Universe />
        </div>
     );
}

export default ProductPage;