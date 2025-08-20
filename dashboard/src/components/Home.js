import React, { useEffect } from "react";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  useEffect(() => {
    // 1. Try to read token from query params
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      // Store it in localStorage for persistence
      localStorage.setItem("token", tokenFromUrl);

      // Optionally clean the URL so token doesn’t stay visible
      window.history.replaceState({}, document.title, "/");
    }

    // 2. Then check token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      // No token — redirect to login (frontend app)
      window.location.href = "http://localhost:5173/signup";
    }
  }, []);

  return (
    <>
      <TopBar />
      <Dashboard />
    </>
  );
};

export default Home;
