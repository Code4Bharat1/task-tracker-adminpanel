'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserFeaturesManager() {
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [selectedUserName, setSelectedUserName] = useState("");
  const [userAccess, setUserAccess] = useState({}); // { userName: { features, maxFeatures, roleIds } }

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_API}/permissions/user-features`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        setUsers(data);

        const map = {};
        const accessMap = {};
        data.forEach((u) => {
          map[u.userName] = {
            userId: u.userId,
            roleIds: u.roleIds || [],
            position: u.position,
          };
          accessMap[u.userName] = {
            features: u.features || [],
            maxFeatures: u.maxFeatures || [],
            roleIds: u.roleIds || [],
          };
        });

        setUserMap(map);
        setUserAccess(accessMap);
        if (data.length > 0) setSelectedUserName(data[0].userName);
      })
      .catch((err) => {
        console.error("Error fetching user features:", err);
      });
  }, []);

  const toggleFeature = (feature) => {
    setUserAccess((prev) => {
      const user = prev[selectedUserName];
      const hasFeature = user.features.includes(feature);
      const hasMaxFeature = user.maxFeatures.includes(feature);

      let newFeatures = [...user.features];
      let newMaxFeatures = [...user.maxFeatures];

      if (hasFeature) {
        // Move from features → maxFeatures
        newFeatures = newFeatures.filter((f) => f !== feature);
        newMaxFeatures.push(feature);
      } else if (hasMaxFeature) {
        // Move from maxFeatures → features
        newMaxFeatures = newMaxFeatures.filter((f) => f !== feature);
        newFeatures.push(feature);
      }

      return {
        ...prev,
        [selectedUserName]: {
          ...user,
          features: newFeatures,
          maxFeatures: newMaxFeatures,
        },
      };
    });
  };

  const getAllFeatures = () => {
    const access = userAccess[selectedUserName];
    if (!access) return [];
    return Array.from(new Set([...access.features, ...access.maxFeatures]));
  };

  const handleSave = async () => {
    const selectedUser = userMap[selectedUserName];
    const access = userAccess[selectedUserName];

    if (!selectedUser || !selectedUser.userId || !access?.roleIds.length) {
      alert("User ID or Role IDs missing for selected user.");
      return;
    }

    const roleAccessUpdates = access.roleIds.map((roleId) => ({
      roleId,
      features: access.features,
      maxFeature: access.maxFeatures, // ✅ FIXED: Include maxFeature
    }));

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/permissions/update-permissions`,
        {
          userId: selectedUser.userId,
          roleAccessUpdates,
        },
        { withCredentials: true }
      );

      alert("Access updated successfully.");
    } catch (err) {
      console.error("Error updating permissions:", err);
      alert("Failed to update access.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Admin Feature Access Manager</h2>

      {users.length > 0 ? (
        <>
          <label>
            Select User:{" "}
            <select
              value={selectedUserName}
              onChange={(e) => setSelectedUserName(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.userId} value={user.userName}>
                  {user.userName} — {user.position}
                </option>
              ))}
            </select>
          </label>

          <h3 style={{ marginTop: "20px" }}>
            Access for <strong>{selectedUserName}</strong>
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            {getAllFeatures().map((feature) => {
              const isChecked = userAccess[selectedUserName]?.features.includes(feature);
              return (
                <label key={feature} style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFeature(feature)}
                  />{" "}
                  {feature} {isChecked ? "(feature)" : "(maxFeature)"}
                </label>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            style={{
              marginTop: "25px",
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </>
      ) : (
        <p>Loading users...</p>
      )}
    </div>
  );
}
