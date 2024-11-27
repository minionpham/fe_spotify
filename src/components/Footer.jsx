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
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const trackExists = response.data.items.some(
        (item) => item.track.id === currentPlaying.id
      );

      if (trackExists) {
        alert("Bài hát này đã có trong playlist!");
        return;
      }

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
      <div className="current-track-container">
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
      <div className="player-controls">
        <PlayerControls />
      </div>
      <div className="volume">
        <Volume />
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  background-color: #181818;
  border-top: 1px solid #282828;
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  position: relative;

  .current-track-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative; /* Ensure the parent container is relative for positioning */
  }

  

  .player-controls {
    z-index: 0;
  }

`;
