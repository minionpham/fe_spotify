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
  const [playlistsWithCurrentTrack, setPlaylistsWithCurrentTrack] = useState(
    {}
  );
  const dropdownRef = useRef(null);

  // Filter playlists based on search query
  const filteredPlaylists = playlists.filter(({ name }) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Xử lý chọn/deselect playlist
  const togglePlaylistSelection = (playlistId) => {
    setSelectedPlaylists(
      (prev) =>
        prev.includes(playlistId)
          ? prev.filter((id) => id !== playlistId) // Bỏ chọn
          : [...prev, playlistId] // Chọn thêm
    );
  };

  const handleConfirmAddToPlaylists = async () => {
    if (
      !currentPlaying ||
      !currentPlaying.id ||
      selectedPlaylists.length === 0
    ) {
      alert("Chưa có bài hát đang phát hoặc chưa chọn playlist!");
      return;
    }

    try {
      for (const playlistId of selectedPlaylists) {
        if (playlistsWithCurrentTrack[playlistId]) continue; // Bỏ qua nếu đã có bài hát

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
      }

      alert("Đã thêm bài hát vào các playlist được chọn!");
      setSelectedPlaylists([]); // Reset các lựa chọn
      await checkTrackInPlaylists(); // Cập nhật danh sách playlist
      setShowPlaylists(false); // Đóng dropdown
    } catch (error) {
      console.error(
        "Error adding track to playlists:",
        error.response?.data || error
      );
      alert("Đã xảy ra lỗi khi thêm bài hát.");
    }
  };

  // Check which playlists contain the currently playing track
  const checkTrackInPlaylists = async () => {
    if (!currentPlaying || !currentPlaying.id) return;

    const updatedPlaylists = {};
    for (const playlist of playlists) {
      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        updatedPlaylists[playlist.id] = response.data.items.some(
          (item) => item.track.id === currentPlaying.id
        );
      } catch (error) {
        console.error("Error checking track in playlist", error);
      }
    }
    setPlaylistsWithCurrentTrack(updatedPlaylists);
  };

  useEffect(() => {
    checkTrackInPlaylists();
  }, [currentPlaying, playlists]);

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

      // After successfully adding the track, update the playlist status
      await checkTrackInPlaylists(); // Refetch the playlist status
    } catch (error) {
      console.error(
        "Error adding track to playlist:",
        error.response?.data || error
      );
      alert("Đã xảy ra lỗi khi thêm bài hát vào danh sách phát.");
    } finally {
      setShowPlaylists(false); // Close the dropdown
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

  // const togglePlaylistSelection = async (playlistId) => {
  //   if (!currentPlaying || !currentPlaying.id) {
  //     alert("Không có bài hát nào đang phát!");
  //     return;
  //   }

  //   await handleAddToPlaylist(currentPlaying.id, playlistId);

  //   setSelectedPlaylists((prev) =>
  //     prev.includes(playlistId)
  //       ? prev.filter((id) => id !== playlistId)
  //       : [...prev, playlistId]
  //   );
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
                      <div
                        className={`circle ${
                          selectedPlaylists.includes(id) ||
                          playlistsWithCurrentTrack[id]
                            ? "selected"
                            : ""
                        }`}
                      >
                        {(selectedPlaylists.includes(id) ||
                          playlistsWithCurrentTrack[id]) && (
                          <span className="checkmark">✔</span>
                        )}
                      </div>
                      <span>{name}</span>
                    </div>
                  </div>
                ))}
                {filteredPlaylists.length === 0 && (
                  <div className="no-results">Không tìm thấy playlist!</div>
                )}
              </div>
              {selectedPlaylists.length > 0 && (
                <button
                  onClick={handleConfirmAddToPlaylists}
                  className="confirm-button"
                >
                  Xác nhận
                </button>
              )}
            </div>
          )}

          <button onClick={handleAddToPlaylistClick} className="add-button">
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

      .playlist-info {
        display: flex;
        justify-content: flex-end; /* Align text to the right */
        align-items: center;
        width: 100%;

        span {
          flex: 1;
          text-align: right; /* Ensure text aligns to the right */
        }

        .circle {
          width: 20px;
          height: 20px;
          border: 2px solid white;
          border-radius: 50%;
          margin-right: 10px; /* Add margin to separate from text */
          position: relative;

          &.selected {
            background-color: #1db954;
            border-color: #1db954;
          }

          .checkmark {
            position: absolute;
            top: 0;
            left: 2px;
            font-size: 16px;
            color: white;
          }
        }
      }
    }

    .no-results {
      text-align: center;
      color: gray;
      font-size: 0.9rem;
      margin-top: 10px;
    }

    .confirm-button {
      background-color: #1db954;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 10px;
      width: 100%;
      margin-top: 10px;
      cursor: pointer;
      text-align: center;
      font-size: 1rem;

      &:hover {
        background-color: #17a74a;
      }
    }
  }
`;
