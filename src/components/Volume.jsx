import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useStateProvider } from "../utils/StateProvider";

export default function Volume() {
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

  // Set volume
  const setVolume = async (e) => {
    await axios.put(
      "https://api.spotify.com/v1/me/player/volume",
      {},
      {
        params: {
          volume_percent: parseInt(e.target.value),
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
  };

  // Add song to playlist
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
      <input
        type="range"
        onMouseUp={(e) => setVolume(e)}
        min={0}
        max={100}
        className="volume-slider"
      />
      <div className="button-container">
        <button
          onClick={showPlaylists ? null : handleAddToPlaylistClick}
          className="add-button"
          disabled={showPlaylists}
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
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem; /* Add space between the volume slider and the button */
  
  

  .volume-slider {
    width: 15rem;
    border-radius: 2rem;
    height: 0.5rem;
  }

  .button-container {
    position: relative;
  }

  .add-button {
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
      background-color: #444;
      cursor: not-allowed;
    }
  }

  .playlist-dropdown {
    position: absolute;
    top: 2rem;
    right: 0;
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
