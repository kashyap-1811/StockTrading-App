import React, {useState, useEffect} from "react";
import axios from "axios";
import "./Holdings.css";

const Holdings = () => {
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    const fetchHoldings = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:8000/holdings", {
          headers: {
            Authorization: `Bearer ${token}`,  // 👈 attach JWT here
          },
        });
        setHoldings(response.data);
      } catch (error) {
        console.error("Error fetching holdings:", error);
      }
    };

    fetchHoldings();
  }, []);

  const totalInvestment = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.price * h.qty, 0);
  const pnl = currentValue - totalInvestment;
  const pnlPercent = ((pnl / totalInvestment) * 100).toFixed(2);

  return (
    <div className="holdings-full-container">
      <h3 className="holdings-title">Holdings ({holdings.length})</h3>

      <div className="summary-row">
        <div className="summary-card">
          <h5>₹{totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h5>
          <p>Total Investment</p>
        </div>
        <div className="summary-card">
          <h5>₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h5>
          <p>Current Value</p>
        </div>
        <div className="summary-card">
          <h5 className={pnl >= 0 ? "profit" : "loss"}>
            ₹{pnl.toFixed(2)} ({pnl >= 0 ? "+" : ""}
            {pnlPercent}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. Cost</th>
              <th>LTP</th>
              <th>Cur. Value</th>
              <th>P&L</th>
              <th>Net Chg.</th>
              <th>Day Chg.</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((item, index) => {
              const currentVal = (item.price * item.qty).toFixed(2);
              const gain = item.price * item.qty - item.avg * item.qty;
              const gainFormatted = gain.toFixed(2);
              const isNetPositive = parseFloat(item.net) >= 0;
              const isDayPositive = parseFloat(item.day) >= 0;

              return (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{item.avg.toFixed(2)}</td>
                  <td>{item.price.toFixed(2)}</td>
                  <td>{currentVal}</td>
                  <td className={gain >= 0 ? "profit" : "loss"}>{gainFormatted}</td>
                  <td className={isNetPositive ? "profit" : "loss"}>{item.net}</td>
                  <td className={isDayPositive ? "profit" : "loss"}>{item.day}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Holdings;
