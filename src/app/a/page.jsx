'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";

const availableFeatures = [
  "settings_access",
  "dashboard_access",
  "reports_access",
  "user_management",
  "analytics_view",
]; // Add all possible features here

export default function UserFeaturesManager() {
  const [users, setUsers] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [userFeaturesUpdates, setUserFeaturesUpdates] = useState({}); // { username: [features] }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_API}/permissions/user-features`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        setUsers(data);
        if (data.length > 0) {
          setSelectedUserName(data[0].userName);
          setUserFeaturesUpdates({
            [data[0].userName]: data[0].features || [],
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUserChange = (e) => {
    const username = e.target.value;
    setSelectedUserName(username);
    const selectedUser = users.find((u) => u.userName === username);
    setUserFeaturesUpdates((prev) => ({
      ...prev,
      [username]: selectedUser?.features || [],
    }));
  };

  const toggleFeature = (feature) => {
    setUserFeaturesUpdates((prev) => {
      const features = prev[selectedUserName] || [];
      if (features.includes(feature)) {
        // remove feature
        return {
          ...prev,
          [selectedUserName]: features.filter((f) => f !== feature),
        };
      } else {
        // add feature
        return {
          ...prev,
          [selectedUserName]: [...features, feature],
        };
      }
    });
  };

  const handleSave = async () => {
    if (!selectedUserName) {
      alert("Please select a user first");
      return;
    }
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/permissions/update-permissions`,
        {
          userName: selectedUserName,
          features: userFeaturesUpdates[selectedUserName] || [],
        },
        { withCredentials: true }
      );
      alert("Features updated successfully");
    } catch (error) {
      console.error("Failed to update features:", error);
      alert("Failed to update features");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>User Features Manager</h2>

      {loading && <p>Loading users...</p>}

      {!loading && users.length === 0 && <p>No users found.</p>}

      {!loading && users.length > 0 && (
        <>
          <label>
            Select User:{" "}
            <select value={selectedUserName} onChange={handleUserChange}>
              {users.map((user) => (
                <option key={user.userName} value={user.userName}>
                  {user.userName} — {user.position}
                </option>
              ))}
            </select>
          </label>

          <h3 style={{ marginTop: 20 }}>
            Features for <em>{selectedUserName}</em>
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            {availableFeatures.map((feature) => {
              const checked =
                userFeaturesUpdates[selectedUserName]?.includes(feature) ||
                false;
              return (
                <label key={feature} style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFeature(feature)}
                  />{" "}
                  {feature}
                </label>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            style={{
              marginTop: 25,
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </>
      )}
    </div>
  );
}
