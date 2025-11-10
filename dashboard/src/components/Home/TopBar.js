import React from "react";

import Menu from "./Menu";

const TopBar = () => {
  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
