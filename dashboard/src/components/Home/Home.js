import React, { useEffect, useState } from "react";
import Dashboard from "../Dashboard";
import TopBar from "./TopBar";
import { StockProvider } from "../../contexts/StockContext";

const Home = () => {
  const [isValid, setIsValid] = useState(null); // null = loading, true/false = checked

  useEffect(() => {
    const checkToken = async () => {
      // 1. Get token from URL first
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");

      if (tokenFromUrl) {
        localStorage.setItem("token", tokenFromUrl);
        window.history.replaceState({}, document.title, "/");
      }

      // 2. Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "http://localhost:5173/signup";
        return;
      }

      try {
        // 3. Verify token with backend
        const res = await fetch("http://localhost:8000/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setIsValid(true);
        } else {
          // Token invalid → clear + redirect
          localStorage.removeItem("token");
          window.location.href = "http://localhost:5173/signup";
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("token");
        window.location.href = "http://localhost:5173/signup";
      }
    };

    checkToken();
  }, []);

  if (isValid === null) {
    return <p>Loading...</p>; // Show loading state while checking token
  }

  return (
    <StockProvider>
      <TopBar />
      <Dashboard />
    </StockProvider>
  );
};

export default Home;
