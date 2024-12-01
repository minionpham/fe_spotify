import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import PlayerControls from "./PlayerControls";
import { useStateProvider } from "../utils/StateProvider";
import axios from "axios";

export default function Footer() {
  const [{ token, playlists, currentPlaying }] = useStateProvider();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const dropdownRef = useRef(null);

  // Filter playlists based on search query
  const filteredPlaylists = playlists.filter(({ name }) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToPlaylist = async (trackId, playlistId) => {
    try {
      const playlistResponse = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (
        !playlistResponse.data ||
        !playlistResponse.data.tracks ||
        !playlistResponse.data.tracks.items
      ) {
        alert("Không thể lấy thông tin danh sách phát.");
        return;
      }
  
      const trackExists = playlistResponse.data.tracks.items.some(
        (item) => item.track.id === trackId
      );
  
      if (trackExists) {
        alert("Bài hát đã có trong danh sách phát!");
        return;
      }
  
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: [`spotify:track:${trackId}`] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      alert("Đã thêm bài hát vào danh sách phát!");
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      alert("Đã xảy ra lỗi khi thêm bài hát vào danh sách phát.");
    } finally {
      setShowPlaylists(false);
    }
  };
  

  // Toggle playlist dropdown
  const handleAddToPlaylistClick = () => {
    setShowPlaylists((prev) => !prev);
    setSearchQuery(""); // Reset search query when opening dropdown
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

  // Check if a playlist already contains the current track
  const checkTrackInPlaylist = async (playlistId) => {
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
      return response.data.items.some(
        (item) => item.track.id === currentPlaying.id
      );
    } catch (error) {
      console.error("Error checking track in playlist", error);
      return false;
    }
  };


  const togglePlaylistSelection = async (playlistId) => {
    if (!currentPlaying || !currentPlaying.id) {
      alert("Không có bài hát nào đang phát!");
      return;
    }
  
    await handleAddToPlaylist(currentPlaying.id, playlistId);
  
    setSelectedPlaylists((prev) =>
      prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId)
        : [...prev, playlistId]
    );
  };
  
  // Toggle playlist selection
  // const togglePlaylistSelection = async (playlistId) => {
  //   if (!currentPlaying || !currentPlaying.id) {
  //     alert("No track is currently playing!");
  //     return;
  //   }

  //   const isSelected = selectedPlaylists.includes(playlistId);

  //   if (isSelected) {
  //     setSelectedPlaylists((prev) =>
  //       prev.filter((id) => id !== playlistId)
  //     );
  //   } else {
  //     const trackExists = await checkTrackInPlaylist(playlistId);
  //     if (!trackExists) {
  //       try {
  //         await axios.post(
  //           `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
  //           { uris: [`spotify:track:${currentPlaying.id}`] },
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //               "Content-Type": "application/json",
  //             },
  //           }
  //         );
  //       } catch (error) {
  //         console.error("Error adding track to playlist", error);
  //         alert("Không thể thêm vào playlist");
  //         return;
  //       }
  //     }
  //     setSelectedPlaylists((prev) => [...prev, playlistId]);
  //   }
  // };

  return (
    <Container>
      <div className="current-track-container">
        <div className="button-container">
          {showPlaylists && (
            <div className="playlist-dropdown" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Tìm một danh sách phát"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <div className="playlist-list">
                {filteredPlaylists.map(({ name, id }) => (
                  <div
                    key={id}
                    className="playlist-item"
                    onClick={() => togglePlaylistSelection(id)}
                  >
                    <div className="playlist-info">
                      <span>{name}</span>
                      <div
                        className={`circle ${
                          selectedPlaylists.includes(id) ? "selected" : ""
                        }`}
                      />
                    </div>
                  </div>
                ))}
                {filteredPlaylists.length === 0 && (
                  <div className="no-results">Không tìm thấy playlist!</div>
                )}
              </div>
            </div>
          )}
          <button
            onClick={!showPlaylists ? handleAddToPlaylistClick : null}
            className="add-button"
            disabled={showPlaylists}
          >
            +
          </button>
        </div>
      </div>
      <div className="player-controls">
        <PlayerControls />
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
    position: relative;
    z-index: 10;
    .button-container {
      position: relative;

      .add-button {
        background-color: #1db954;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 1;
      }
    }
  }

  .playlist-dropdown {
    position: absolute;
    bottom: 50px;
    left: 0;
    background-color: #282828;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    width: 250px;
    z-index: 2;

    .search-input {
      width: 100%;
      padding: 5px;
      margin-bottom: 10px;
      border: none;
      border-radius: 3px;
      background-color: #181818;
      color: white;
    }

    .playlist-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .playlist-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 10px;
      cursor: pointer;
      
      &:hover {
        background-color: #767676;
      }

      .circle {
        width: 20px;
        height: 20px;
        border: 2px solid white;
        border-radius: 50%;
      }

      .circle.selected {
        background-color: #1db954;
        border-color: #1db954;
      }
    }

    .no-results {
      text-align: center;
      color: gray;
      font-size: 0.9rem;
      margin-top: 10px;
    }
  }
`;
