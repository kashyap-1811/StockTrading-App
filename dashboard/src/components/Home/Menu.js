import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const Menu = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Function to check if a route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get("http://localhost:8000/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  return (
    <div className="menu-container">
      <img src="../../logo.png" alt="Logo" style={{ width: "50px" }} />
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
            >
              <p className={isActiveRoute("/") ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
            >
              <p className={isActiveRoute("/holdings") ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/funds"
            >
              <p className={isActiveRoute("/funds") ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          
        </ul>
        <hr />
        <Link style={{ textDecoration: "none" }} to="/profile">
          <div className={`profile ${isActiveRoute("/profile") ? "active" : ""}`} onClick={handleProfileClick}>
            <div className="avatar">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-initial">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <p className={`username ${isActiveRoute("/profile") ? "active" : ""}`}>{user?.name || 'Profile'}</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Menu;
