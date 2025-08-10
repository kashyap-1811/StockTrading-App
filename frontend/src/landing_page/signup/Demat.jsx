import "./Demat.css"
function Demat() {
    return (
        <>
            <h1 className="mt-5">Investment options with Zerodha demat account</h1>

            <div className="rol">
                <div className="col-3">
                    <img src="images/stocks-signup.svg" alt="stocks" />
                    <h2>Stocks</h2>
                    <p>Invest in all exchange-listed securities</p>
                </div>

                <div className="col-3">
                    <img src="images/mf-acop.svg" alt="mf" />
                    <h2>Mutual Funds</h2>
                    <p>Invest in commission-free direct mutual funds</p>
                </div>

                <div className="col-3">
                    <img src="images/ipo-acop.svg" alt="ipo" />
                    <h2>IPO</h2>
                    <p>Apply to the latest IPOs instantly via UPI</p>
                </div>

                <div className="col-3">
                    <img src="images/fo-acop.svg" alt="fo" />
                    <h2>Futures and Options</h2>
                    <p>Hedge and mitigate market risk through simplified F&O trading</p>
                </div>
            </div>

            <div className="row text-center justify-content-center">
                <div className='col-12 mb-5'>
                <button
                    className='btn btn-primary fs-5 py-2 mt-2 d-none d-lg-inline-block'
                    style={{ width: "20%" }}
                >
                    Explore Investments
                </button>
                <button
                    className='btn btn-primary fs-5 py-2 mt-2 d-inline-block d-lg-none'
                    style={{ width: "80%" }}
                >
                    Explore Investments
                </button>
            </div>
            </div>
        </>
    );
}

export default Demat;