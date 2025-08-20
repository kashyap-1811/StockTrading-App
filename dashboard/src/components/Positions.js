import React, {useState, useEffect} from "react";
import axios from "axios";
import "./Positions.css";

const Positions = () => {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const fetchPositions = async () => {
      const token = localStorage.getItem("token");
  
      try {
        const response = await axios.get("http://localhost:8000/positions", {
          headers: {
            Authorization: `Bearer ${token}`,  // 👈 attach JWT here
          },
        });
        setPositions(response.data);
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };

    fetchPositions();
  }, []);

  return (
    <div className="positions-full-container">
      <h3 className="positions-title">Positions ({positions.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg.</th>
              <th>LTP</th>
              <th>P&L</th>
              <th>Chg.</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((item, index) => {
              const isNetPositive = parseFloat(item.net) >= 0;
              const isDayPositive = parseFloat(item.day) >= 0;

              return (
                <tr key={index}>
                  <td>{item.product}</td>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{item.avg.toFixed(2)}</td>
                  <td>{item.price.toFixed(2)}</td>
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

export default Positions;
