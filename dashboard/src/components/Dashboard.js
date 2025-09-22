import React from "react";
import { Route, Routes } from "react-router-dom";

// Apps removed
import Funds from "./funds/Funds";
import Holdings from "./Holdings/Holdings";
import StockAnalytics from "./StockAnalytics/StockAnalytics";

// Positions removed
import Profile from "./Profile/Profile";
import WatchList from "./WatchList/WatchList";
import Summary from "./Summary/Summary";
import ErrorPage from "./Error/Error";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <WatchList />
      <div className="content">
        <Routes>
          <Route path="/" element={<Summary />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/stock/:stockName" element={<StockAnalytics />} />
          <Route path="/*" element={
            <ErrorPage 
              type="404"
              title="So Sorry!"
              message="The page you are looking for cannot be found"
              showHome={true}
              showRetry={false}
            />
          } />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
