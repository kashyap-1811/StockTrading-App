import React from "react";
import './Hero.css'

const Hero = () => {
  return (
    <main className="outer-wrapper py-5">
      <div className="container px-4 custom-width">

        {/* About Heading */}
        <section className="text-center border-bottom pb-4 mb-4">
          <h2 className="fs-3">
            We pioneered the discount broking model in India.
            <br />
            Now, we are breaking ground with our technology.
          </h2>
        </section>

        {/* About History */}
        <section className="mb-5">
          <div className="row">
            <div className="col-md-6 mb-4">
              <p>
                We kick-started operations on the 15th of August, 2010 with the
                goal of breaking all barriers that traders and investors face in
                India in terms of cost, support, and technology. We named the
                company Zerodha, a combination of Zero and "Rodha", the Sanskrit
                word for barrier.
              </p>
              <p>
                Today, our disruptive pricing models and in-house technology have
                made us the biggest stock broker in India.
              </p>
              <p>
                Over <span className="fw-bold">1.6+ crore</span> clients place
                billions of orders every year through our powerful ecosystem of
                investment platforms, contributing over 15% of all Indian retail
                trading volumes.
              </p>
            </div>
            <div className="col-md-6">
              <p>
                In addition, we run a number of popular open online educational
                and community initiatives to empower retail traders and
                investors.
              </p>
              <p>
                <a href="https://rainmatter.com/" target="_blank" rel="noreferrer">
                  Rainmatter
                </a>
                , our fintech fund and incubator, has invested in several fintech
                startups with the goal of growing the Indian capital markets.
              </p>
              <p>
                And yet, we are always up to something new every day. Catch up on
                the latest updates on our{" "}
                <a href="/z-connect">blog</a> or see what the media is{" "}
                <a href="/media">saying about us</a> or learn more about our
                business and product{" "}
                <a href="/about/philosophy/">philosophies</a>.
              </p>
            </div>
          </div>
        </section>

        {/* People Section */}
        <section>
          <h2 className="text-center mb-5">Founder</h2>
          <div className="row align-items-center flex-column-reverse flex-md-row">
            <div className="col-md-5 text-center mb-4 mb-md-0">
              <img
                src="images/profile_photo.jpg"
                alt="Kashyap Rupareliya"
                className="img-fluid rounded"
                style={{ maxHeight: "300px", borderRadius: "100%" }}
              />
              <h5 className="mt-3">Kashyap Rupareliya</h5>
              <p className="text-muted">Founder, CEO</p>
            </div>
            <div className="col-md-7">
              <p>
                Kashyap bootstrapped and founded Zerodha in 2010 to overcome the
                hurdles he faced during his decade-long stint as a trader. Today,
                Zerodha has changed the landscape of the Indian broking industry.
              </p>
              <p>
                He is a member of the SEBI Secondary Market Advisory Committee
                (SMAC) and the Market Data Advisory Committee (MDAC).
              </p>
              <p>Playing basketball is his zen.</p>
              <p>
                Connect on{" "}
                <a href="https://nithinkamath.me/" target="_blank" rel="noreferrer">
                  Homepage
                </a>{" "}
                /{" "}
                <a
                  href="https://tradingqna.com/u/nithin/summary"
                  target="_blank"
                  rel="noreferrer"
                >
                  TradingQnA
                </a>{" "}
                /{" "}
                <a
                  href="https://twitter.com/Nithin0dha"
                  target="_blank"
                  rel="noreferrer"
                >
                  Twitter
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Hero;
