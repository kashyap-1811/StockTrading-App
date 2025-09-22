import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    birthday: ""
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setEditForm({
          name: res.data.name || "",
          phone: res.data.phone || "",
          birthday: res.data.birthday ? new Date(res.data.birthday).toISOString().split('T')[0] : ""
        });
      } catch (e) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateMessage("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : ""
    });
    setUpdateMessage("");
  };

  const handleSave = async () => {
    setUpdateLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:8000/profile/update", editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUser(res.data);
      setIsEditing(false);
      setUpdateMessage("Profile updated successfully!");
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (e) {
      setUpdateMessage("Failed to update profile");
      setTimeout(() => setUpdateMessage(""), 3000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <p>No profile found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="avatar-image" />
          ) : (
            <div className="avatar-initial">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      {updateMessage && (
        <div className={`update-message ${updateMessage.includes('success') ? 'success' : 'error'}`}>
          {updateMessage}
        </div>
      )}

      <div className="profile-content">
        <div className="stats-grid">
          <div className="stat-card wallet">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Wallet Balance</div>
              <div className="stat-value">₹{user.points?.toLocaleString('en-IN') || 0}</div>
            </div>
          </div>
          
          <div className="stat-card holdings">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-label">Total Holdings</div>
              <div className="stat-value">{user.holdings ? user.holdings.length : 0}</div>
            </div>
          </div>
          
          <div className="stat-card status">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">Account Status</div>
              <div className="stat-value">{user.isActive ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
          
          <div className="stat-card kyc">
            <div className="stat-icon">🆔</div>
            <div className="stat-content">
              <div className="stat-label">KYC Status</div>
              <div className={`stat-value kyc-${user.kycStatus}`}>
                {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="section-header">
            <h2 className="section-title">Personal Information</h2>
            <div className="section-actions">
              {!isEditing ? (
                <button className="edit-button" onClick={handleEdit}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-button" 
                    onClick={handleSave}
                    disabled={updateLoading}
                  >
                    {updateLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button className="cancel-button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="details-grid">
            <div className="detail-item">
              <label className="detail-label">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="detail-input"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="detail-value">{user.name}</div>
              )}
            </div>

            <div className="detail-item">
              <label className="detail-label">Email Address</label>
              <div className="detail-value email-disabled">{user.email}</div>
              <div className="detail-note">Email cannot be changed</div>
            </div>

            <div className="detail-item">
              <label className="detail-label">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                  className="detail-input"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="detail-value">{user.phone || "Not provided"}</div>
              )}
            </div>

            <div className="detail-item">
              <label className="detail-label">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="birthday"
                  value={editForm.birthday}
                  onChange={handleInputChange}
                  className="detail-input"
                />
              ) : (
                <div className="detail-value">
                  {user.birthday ? new Date(user.birthday).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : "Not provided"}
                </div>
              )}
            </div>

            <div className="detail-item">
              <label className="detail-label">Member Since</label>
              <div className="detail-value">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="detail-item">
              <label className="detail-label">Last Updated</label>
              <div className="detail-value">
                {new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


