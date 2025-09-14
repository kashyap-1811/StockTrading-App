import React from "react";
import { Route, Routes } from "react-router-dom";

// Apps removed
import Funds from "./Funds";
import Holdings from "./Holdings";

// Positions removed
import Profile from "./Profile";
import Summary from "./Summary";
import Trade from "./Trade";
import WatchList from "./WatchList";
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
          {/* Orders removed */}
          <Route path="/holdings" element={<Holdings />} />
          {/* Positions removed */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/trade/:symbol" element={<Trade />} />
          <Route path="/funds" element={<Funds />} />
          {/* Apps removed */}
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
