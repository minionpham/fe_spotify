import React, { useState, useEffect } from "react";
import styled from "styled-components";

// Styled components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Popup = styled.div`
  background-color: #2f2f2f;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  color: white; /* Text color set to white */
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  position: absolute;
  top: 0px;
  right: -30px;
  cursor: pointer;
  color: white;
`;

const Content = styled.div`
  margin: 20px 0;

  label {
    display: block;
    margin-bottom: 15px;
    color: white;

    input[type="color"] {
      margin-left: 10px;
      width: 20px;
      height: 20px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
    }
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:first-child {
    background-color: #007bff;
    color: white;

    &:hover {
      background-color: #0056b3;
    }
  }

  button:last-child {
    background-color: #ccc;

    &:hover {
      background-color: #999;
    }
  }
`;

// React component
export default function SettingsPopup({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    backgroundColor: "rgb(32, 87, 100)", // Default background color
    notifications: true,
    language: "en",
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedBackgroundColor = localStorage.getItem("backgroundColor");
    const defaultColor = "rgb(32, 87, 100)"; // Default background color
    setSettings((prev) => ({
      ...prev,
      backgroundColor: savedBackgroundColor || defaultColor,
    }));
    document.body.style.backgroundColor = savedBackgroundColor || defaultColor;
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem("backgroundColor", settings.backgroundColor);
    document.body.style.backgroundColor = settings.backgroundColor;
    console.log("Settings saved:", settings);
    onClose();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleColorChange = (hexColor) => {
    // Convert hex color to rgb
    const hexToRgb = (hex) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgb(${r}, ${g}, ${b})`;
    };
  
    const rgbColor = hexToRgb(hexColor);
    setSettings((prev) => ({ ...prev, backgroundColor: rgbColor }));
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleOverlayClick}>
      <Popup>
        <h2>Settings</h2>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Content>
          <label>
            Change Background Color:
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </label>
          <label>
            Notifications:
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Language:
            <select
              name="language"
              value={settings.language}
              onChange={handleInputChange}
            >
              <option value="en">English</option>
              <option value="vi">Vietnamese</option>
              <option value="es">Spanish</option>
            </select>
          </label>
        </Content>
        <Actions>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </Actions>
      </Popup>
    </Overlay>
  );
}
