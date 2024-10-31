import React, { useState } from "react";
import styled from "styled-components";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";
import axios from "axios";

export default function Footer() {
  const [{ token, playlists, currentTrack }, dispatch] = useStateProvider();
  const [showPlaylists, setShowPlaylists] = useState(false);

  // Hàm xử lý khi nhấp vào nút +
  const handleAddToPlaylistClick = () => {
    setShowPlaylists(!showPlaylists); // Toggle hiển thị danh sách playlist
  };

  // Hàm xử lý khi nhấp vào một playlist trong danh sách
  const handleAddSongToPlaylist = async (playlistId) => {
    if (!currentTrack || !currentTrack.id) {
      alert("Không có bài hát nào đang phát!");
      return;
    }

    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          uris: [`spotify:track:${currentTrack.id}`],
        },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Bài hát đã được thêm vào playlist!");
    } catch (error) {
      console.error("Lỗi khi thêm bài hát vào playlist:", error);
      alert("Không thể thêm bài hát vào playlist.");
    }
    setShowPlaylists(false); // Ẩn danh sách playlist sau khi thêm bài hát
  };

  return (
    <Container>
      <div className="footer-content">
        <button onClick={handleAddToPlaylistClick} className="add-button">+</button>
        {showPlaylists && (
          <div className="playlist-dropdown">
            {playlists.map(({ name, id }) => (
              <div key={id} onClick={() => handleAddSongToPlaylist(id)} className="playlist-item">
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
  position: relative;
  background-color: #282828;
  color: #b3b3b3;
  padding: 1rem;
  .footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
  }

  .playlist-dropdown {
    position: absolute;
    bottom: 3rem;
    background-color: #333;
    border-radius: 4px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    max-height: 10rem;
    overflow-y: auto;
    width: 200px;

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
