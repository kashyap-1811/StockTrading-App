function OpenAccount() {
    return (
        <div className='container py-5 mb-3'>
            <div className='row text-center justify-content-center'>
                <h1>Open a Zerodha account</h1>
                <p>
                    Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and F&O trades.
                </p>

                <div className='col-12'>
                    <a 
                        className='btn btn-primary fs-5 py-2 mt-2 d-none d-lg-inline-block'
                        style={{ width: "20%" }}
                        href = '/signup'
                    >
                        Sign Up for Free
                    </a>
                    <a
                        className='btn btn-primary fs-5 py-2 mt-2 d-inline-block d-lg-none'
                        style={{ width: "80%" }}
                        href='/signup'
                    >
                        Sign Up for Free
                    </a>
                </div>
            </div>
        </div>
    );
}

export default OpenAccount;
