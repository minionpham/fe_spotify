import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import PlayerControls from "./PlayerControls";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";
import axios from "axios";

export default function Footer() {
  const [{ token, playlists, currentPlaying, selectedPlaylist }, dispatch] =
    useStateProvider();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [playlistsWithCurrentTrack, setPlaylistsWithCurrentTrack] = useState(
    {}
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    const getCurrentTrack = async () => {
      try {
        const response = await axios.get(
          "https://api.spotify.com/v1/me/player/currently-playing",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        );
  
        if (response.data && response.data.item) {
          const currentTrack = {
            id: response.data.item.id,
            name: response.data.item.name,
            artists: response.data.item.artists.map((artist) => artist.name),
            image: response.data.item.album.images[2].url,
            duration: response.data.item.duration_ms,
            album: response.data.item.album.name,
            context_uri: response.data.item.album.uri,
            track_number: response.data.item.track_number,
            uri: response.data.item.uri,
          };
  
          dispatch({
            type: reducerCases.SET_CURRENT_PLAYING,
            currentPlaying: currentTrack,
          });
        } else {
          console.log("No current track playing.");
        }
      } catch (error) {
        console.error("Error fetching current track:", error);
      }
    };
  
    getCurrentTrack();
  }, [token, dispatch]);  

  // const handleConfirmAddToPlaylists = async () => {
  //   if (
  //     !currentPlaying ||
  //     !currentPlaying.id ||
  //     !currentPlaying.name ||
  //     selectedPlaylists.length === 0
  //   ) {
  //     alert("Chưa có bài hát đang phát hoặc chưa chọn playlist!");
  //     return;
  //   }
  
  //   try {
  //     for (const playlistId of selectedPlaylists) {
  //       if (playlistsWithCurrentTrack[playlistId]) continue;
  
  //       await axios.post(
  //         `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
  //         { uris: [`spotify:track:${currentPlaying.id}`] },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  
  //       // Update selected playlist if current track is added
  //       if (playlistId === selectedPlaylist?.id) {
  //         const newTrack = {
  //           id: currentPlaying.id,
  //           name: currentPlaying.name,
  //           artists: currentPlaying.artists,
  //           image: currentPlaying.image,
  //           duration: currentPlaying.duration,
  //           album: currentPlaying.album,
  //           context_uri: currentPlaying.context_uri,
  //           track_number: currentPlaying.track_number,
  //           uri: currentPlaying.uri,
  //         };
  
  //         dispatch({
  //           type: reducerCases.SET_PLAYLIST,
  //           selectedPlaylist: {
  //             ...selectedPlaylist,
  //             tracks: [...selectedPlaylist.tracks, newTrack],
  //           },
  //         });
  //       }
  //     }
  
  //     alert("Đã thêm bài hát vào các playlist!");
  
  //     const updatedPlaylists = { ...playlistsWithCurrentTrack };
  //     selectedPlaylists.forEach((playlistId) => {
  //       updatedPlaylists[playlistId] = true;
  //     });
  //     setPlaylistsWithCurrentTrack(updatedPlaylists);
  
  //     setSelectedPlaylists([]);
  //     setShowPlaylists(false);
  //   } catch (error) {
  //     console.error(
  //       "Error adding track to playlists:",
  //       error.response?.data || error
  //     );
  //     alert("Đã xảy ra lỗi khi thêm bài hát.");
  //   }
  // };
  const handleConfirmAddToPlaylists = async () => {
    if (
      !currentPlaying ||
      !currentPlaying.id ||
      !currentPlaying.name ||
      selectedPlaylists.length === 0
    ) {
      alert("Chưa có bài hát đang phát hoặc chưa chọn playlist!");
      return;
    }
  
    try {
      for (const playlistId of selectedPlaylists) {
        if (playlistsWithCurrentTrack[playlistId]) continue;
  
        // Gửi API thêm bài hát vào playlist
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
  
        // Lấy thông tin mới nhất của playlist sau khi thêm bài hát
        const playlistResponse = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlistId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        const updatedTracks = playlistResponse.data.tracks.items.map((item) => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((artist) => artist.name).join(", "),
          album: item.track.album?.name || "Unknown Album",
          image: item.track.album?.images?.[0]?.url || "",
          duration: item.track.duration_ms,
          context_uri: item.track.album?.uri,
          track_number: item.track.track_number,
          uri: item.track.uri,
        }));
  
        const updatedImage =
          updatedTracks.length > 0 ? updatedTracks[0].image : "";
  
        // Nếu playlist được chọn là playlist hiện tại, cập nhật lại state
        if (playlistId === selectedPlaylist?.id) {
          dispatch({
            type: reducerCases.SET_PLAYLIST,
            selectedPlaylist: {
              ...selectedPlaylist,
              tracks: updatedTracks,
              image: updatedImage,
            },
          });
        }
  
        // Cập nhật hình ảnh playlist trong danh sách playlists toàn cục
        dispatch({
          type: reducerCases.SET_PLAYLISTS,
          playlists: playlists.map((playlist) =>
            playlist.id === playlistId
              ? { ...playlist, image: updatedImage }
              : playlist
          ),
        });
      }
  
      alert("Đã thêm bài hát vào các playlist!");
  
      // Cập nhật danh sách playlist đã chứa bài hát
      const updatedPlaylists = { ...playlistsWithCurrentTrack };
      selectedPlaylists.forEach((playlistId) => {
        updatedPlaylists[playlistId] = true;
      });
      setPlaylistsWithCurrentTrack(updatedPlaylists);
  
      // Reset trạng thái
      setSelectedPlaylists([]);
      setShowPlaylists(false);
    } catch (error) {
      console.error(
        "Error adding track to playlists:",
        error.response?.data || error
      );
      alert("Đã xảy ra lỗi khi thêm bài hát.");
    }
  };
  

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
                {/* {filteredPlaylists.map(({ name, id }) => (
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
                ))} */}
                {filteredPlaylists.map(({ name, id }) => (
                  <div
                    key={id}
                    className="playlist-item"
                    onClick={() => {
                      if (!playlistsWithCurrentTrack[id]) {
                        togglePlaylistSelection(id);
                      }
                    }} // <-- Chỗ này sẽ được sửa
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

  .playlist-item.disabled {
    pointer-events: none; /* Vô hiệu hóa nhấp chuột */
    opacity: 0.5; /* Làm mờ để hiển thị trạng thái không hoạt động */
    cursor: not-allowed; /* Hiển thị con trỏ không cho phép */
  }
`;
