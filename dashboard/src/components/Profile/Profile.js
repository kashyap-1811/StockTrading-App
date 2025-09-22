import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (e) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>No profile</div>;

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          borderRadius: "50%", 
          backgroundColor: "#2563eb", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          marginRight: "24px",
          fontSize: "32px",
          color: "white",
          fontWeight: "bold"
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "600", color: "#1f2937" }}>
            {user.name}
          </h2>
          <p style={{ margin: "0", color: "#6b7280", fontSize: "16px" }}>{user.email}</p>
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "24px",
        marginBottom: "32px"
      }}>
        <div style={{ 
          backgroundColor: "#f8fafc", 
          padding: "20px", 
          borderRadius: "12px",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>Phone</div>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>{user.phone}</div>
        </div>
        
        <div style={{ 
          backgroundColor: "#f8fafc", 
          padding: "20px", 
          borderRadius: "12px",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>Date of Birth</div>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
            {new Date(user.birthday).toLocaleDateString()}
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: "#f0f9ff", 
          padding: "20px", 
          borderRadius: "12px",
          border: "1px solid #bae6fd"
        }}>
          <div style={{ color: "#0369a1", fontSize: "14px", marginBottom: "8px" }}>Wallet Points</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#0c4a6e" }}>
            ₹{user.points?.toLocaleString('en-IN') || 0}
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: "#f0fdf4", 
          padding: "20px", 
          borderRadius: "12px",
          border: "1px solid #bbf7d0"
        }}>
          <div style={{ color: "#166534", fontSize: "14px", marginBottom: "8px" }}>Total Holdings</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#14532d" }}>
            {user.holdings ? user.holdings.length : 0}
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: "#f8fafc", 
        padding: "24px", 
        borderRadius: "12px",
        border: "1px solid #e2e8f0"
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "600", color: "#1f2937" }}>
          Account Information
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
            <span style={{ color: "#6b7280" }}>Account Status</span>
            <span style={{ color: "#059669", fontWeight: "600" }}>Active</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
            <span style={{ color: "#6b7280" }}>Member Since</span>
            <span style={{ color: "#1f2937", fontWeight: "500" }}>
              {new Date().getFullYear()}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
            <span style={{ color: "#6b7280" }}>Trading Status</span>
            <span style={{ color: "#059669", fontWeight: "600" }}>Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


