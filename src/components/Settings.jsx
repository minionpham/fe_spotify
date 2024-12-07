import React, { useState, useEffect } from "react";
import styled from "styled-components";

// Styled components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Popup = styled.div`
  background-color: #1e1e1e;
  padding: 30px;
  border-radius: 12px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  color: #fff;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2.5rem;
  position: absolute;
  top: 0px;
  right:  0px;
  cursor: pointer;
  color: #bbb;
  transition: color 0.2s ease;

  &:hover {
    color: #fff;
  }
`;

const Header = styled.h2`
  margin-bottom: 20px;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
`;

const Content = styled.div`
  margin-bottom: 20px;

  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.2rem; /* Larger text size */
    margin-bottom: 15px;

    input[type="color"] {
      width: 40px; 
      height: 30px;
      cursor: pointer;
      appearance: none; 
      background-color: transparent;
      transition: transform 0.2s ease;
      border: none; 
      outline: none;
      &:hover {
        transform: scale(1.1); /* Slight enlargement on hover */
      }
    }

    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: center; /* Center the buttons */
  gap: 10px;

  button {
    padding: 12px 25px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  button:first-child {
    background-color: #1db954;
    color: #fff;

    &:hover {
      background-color: #17a84e;
    }
  }

  button:last-child {
    background-color: #444;
    color: #fff;

    &:hover {
      background-color: #333;
    }
  }
`;
// Utility functions
const rgbToHex = (rgb) => {
  const result = rgb.match(/\d+/g);
  if (!result) return "#000000";
  const [r, g, b] = result.map(Number);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
};

export default function SettingsPopup({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    backgroundColor: "#1DB954", // Default background color
    notifications: true,
  });

  const [previewColor, setPreviewColor] = useState("#1DB954");

  // Initialize settings from localStorage and apply the background color
  useEffect(() => {
    const savedBackgroundColor = localStorage.getItem("backgroundColor") || "#1DB954";
    setSettings((prev) => ({
      ...prev,
      backgroundColor: savedBackgroundColor,
    }));
    setPreviewColor(savedBackgroundColor); // Set preview color to the saved color
    document.body.style.backgroundColor = savedBackgroundColor; // Apply saved color to the background
  }, []);

  const handleSave = () => {
    localStorage.setItem("backgroundColor", previewColor); // Save to localStorage
    setSettings((prev) => ({
      ...prev,
      backgroundColor: previewColor, // Update state
    }));
    document.body.style.backgroundColor = previewColor; // Apply immediately
    onClose(); // Close the popup
    setTimeout(() => {
      window.location.reload(); // Refresh the page after a brief delay
    }, 100); // Adding a slight delay ensures UI updates before reload
  };

  const handleColorChange = (hexColor) => {
    setPreviewColor(hexColor); // Update preview color
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <Popup>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Header>Settings</Header>
        <Content>
          <label>
            Background Color:
            <input
              type="color"
              value={previewColor}
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </label>
          <label>
            Enable Notifications:
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={(e) =>
                setSettings({ ...settings, notifications: e.target.checked })
              }
            />
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