import React from 'react';

function Universe() {
    return (
        <>
            <div className="container-fluid py-5 hero-content">
                <div className="row">
                    <div className="col-12 text-center">
                        <h1 className="hero-main-title mb-2">
                            The Zerodha Universe
                        </h1>
                        <p className="hero-subtitle mt-2 mb-5">
                            Extend your trading and investment experience even further with our partner platforms
                        </p>
                    </div>
                </div>
            </div>

            <div className='container'>
    <div className='row gy-5'>
        {[
            {
                img: "images/zerodhaFundhouse.png",
                text: "Our asset management venture that is creating simple and transparent index funds to help you save for your goals."
            },
            {
                img: "images/sensibull.svg",
                text: "Options trading platform that lets you create strategies, analyze positions, and examine data points like open interest, FII/DII, and more."
            },
            {
                img: "images/tijori.svg",
                text: "Investment research platform that offers detailed insights on stocks, sectors, supply chains, and more."
            },
            {
                img: "images/streakLogo.png",
                text: "Systematic trading platform that allows you to create and backtest strategies without coding."
            },
            {
                img: "images/smallcaseLogo.png",
                text: "Thematic investing platform that helps you invest in diversified baskets of stocks on ETFs."
            },
            {
                img: "images/dittoLogo.png",
                text: "Personalized advice on life and health insurance. No spam and no mis-selling."
            }
        ].map((item, index) => (
            <div key={index} className='col-md-4 col-12 d-flex align-items-center justify-content-center'>
                <div className='d-flex flex-md-column flex-column-reverse align-items-center text-center gap-2'>
                    <img
                        src={item.img}
                        alt='Platform logo'
                        className='img-fluid'
                        style={{ maxWidth: '200px', height: '50px', objectFit: 'contain' }}
                    />
                    <p className='mb-0 px-2' style={{ maxWidth: '300px' }}>{item.text}</p>
                </div>
            </div>
        ))}
    </div>

    <div className='row mt-5 mb-5'>
        <div className='col-12 text-center'>
            <button
                className='btn btn-primary fs-5 py-2 d-none d-lg-inline-block'
                style={{ width: "20%" }}
                onClick={() => window.location.href = '/signup'}
            >
                Sign Up for Free
            </button>
            <button
                className='btn btn-primary fs-5 py-2 d-inline-block d-lg-none'
                style={{ width: "80%" }}
                onClick={() => window.location.href = '/signup'}
            >
                Sign Up for Free
            </button>
        </div>
    </div>
</div>

        </>
    );
}

export default Universe;