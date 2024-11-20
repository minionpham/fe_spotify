import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import CurrentTrack from "./CurrentTrack";
import PlayerControls from "./PlayerControls";
import Volume from "./Volume";
import { useStateProvider } from "../utils/StateProvider";
import axios from "axios";

export default function Footer() {
  const [{ token, playlists, currentPlaying }] = useStateProvider();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle playlist dropdown
  const handleAddToPlaylistClick = () => {
    setShowPlaylists((prev) => !prev);
  };

  // Close dropdown if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPlaylists(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add current track to selected playlist
  const handleAddSongToPlaylist = async (playlistId) => {
    if (!currentPlaying || !currentPlaying.id) {
      alert("No track is currently playing!");
      return;
    }

    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: [`spotify:track:${currentPlaying.id}`] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Bài hát đang phát đã thêm vào playlist");
    } catch (error) {
      console.error("Lỗi không thêm được vào playlist", error);
      alert("Không thêm được vào playlist");
    }
    setShowPlaylists(false); // Hide playlist dropdown after adding the track
  };

  return (
    <Container>
      <div className="current-track-and-button">
        <CurrentTrack />
        <div className="button-container">
          <button 
            onClick={showPlaylists ? null : handleAddToPlaylistClick} 
            className="add-button" 
            disabled={showPlaylists} // Disable button if dropdown is shown
          >
            +
          </button>
          {showPlaylists && (
            <div className="playlist-dropdown" ref={dropdownRef}>
              {playlists.map(({ name, id }) => (
                <div 
                  key={id} 
                  onClick={() => handleAddSongToPlaylist(id)} 
                  className="playlist-item"
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <PlayerControls />
      <Volume />
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  background-color: #181818;
  border-top: 1px solid #282828;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  position: relative;

  .current-track-and-button {
    display: flex;
    align-items: center;
    position: relative; /* Relative positioning for dropdown */
  }

  .button-container {
    position: relative;
  }

  .add-button {
    margin-left: 1rem;
    background-color: #1db954;
    color: white;
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
    &:hover {
      background-color: #1ed760;
    }
    &:disabled {
      background-color: #444; /* Change color when disabled */
      cursor: not-allowed; /* Show not-allowed cursor */
    }
  }

  .playlist-dropdown {
    position: absolute;
    top: -12rem; /* Adjusts dropdown to appear above the button */
    right: 0; /* Aligns dropdown to the right edge of the button */
    background-color: #333;
    border-radius: 4px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    max-height: 10rem;
    overflow-y: auto;
    width: 200px;
    z-index: 10;

    .playlist-item {
      padding: 0.5rem;
      color: white;
      cursor: pointer;
      &:hover {
        background-color: #444;
      }
    }
  }
`;
