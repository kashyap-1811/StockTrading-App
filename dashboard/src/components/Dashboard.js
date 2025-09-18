import React from "react";
import { Route, Routes } from "react-router-dom";

// Apps removed
import Funds from "./funds/Funds";
import Holdings from "./Holdings/Holdings";

// Positions removed
import Profile from "./Profile";
import Summary from "./Summary";
import Trade from "./Trade";
import WatchList from "./WatchList/WatchList";
import { GeneralContextProvider } from "./GeneralContext";
import NotFound from "./NotFound";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <GeneralContextProvider>
        <WatchList />
      </GeneralContextProvider>
      <div className="content">
        <Routes>
          <Route exact path="/" element={<Summary />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trade/:symbol" element={<Trade />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
