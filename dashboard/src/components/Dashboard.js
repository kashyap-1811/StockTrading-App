import React from "react";
import { Route, Routes } from "react-router-dom";

// Apps removed
import Funds from "./funds/Funds";
import Holdings from "./Holdings/Holdings";
import StockAnalytics from "./StockAnalytics/StockAnalytics";

// Positions removed
import Profile from "./Profile/Profile";
import Trade from "./Trade";
import WatchList from "./WatchList/WatchList";
import { GeneralContextProvider } from "../contexts/GeneralContext";
import NotFound from "./NotFound";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <GeneralContextProvider>
        <WatchList />
      </GeneralContextProvider>
      <div className="content">
        <Routes>
          <Route path="/" element={<WatchList />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trade/:symbol" element={<Trade />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/stock/:stockName" element={<StockAnalytics />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
