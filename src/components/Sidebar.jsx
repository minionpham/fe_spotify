import React, { useState } from "react";
import styled from "styled-components";
import Playlists from "./Playlists";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";

export default function Sidebar() {
  const [showCreateInput, setShowCreateInput] = useState(false); // Trạng thái để hiển thị input
  const [, dispatch] = useStateProvider();

  const handleHomeClick = () => {
    dispatch({ type: reducerCases.SET_PLAYLIST_ID, selectedPlaylistId: null });
  };

  // Hàm này sẽ truyền xuống component Playlist để ẩn input sau khi tạo playlist
  const handleCreatePlaylistSuccess = () => {
    setShowCreateInput(false);
  };

  return (
    <Container>
      <div className="top__links">
        <div className="logo">
          <img
            src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Full_Logo_RGB_White.png"
            alt="Spotify-Clone-Logo"
          />
        </div>
        <ul>
          <li onClick={handleHomeClick}>
            <span>Home</span>
          </li>
          <li>
            <span>Search</span>
          </li>
          <li className="library">
            <span>Your Library</span>
            <button onClick={() => setShowCreateInput(!showCreateInput)}>
              +
            </button>
          </li>
        </ul>
      </div>
      {/* Truyền prop handleCreatePlaylistSuccess */}
      <Playlists showCreateInput={showCreateInput} onCreateSuccess={handleCreatePlaylistSuccess} />
    </Container>
  );
}

const Container = styled.div`
  background-color: black;
  color: #b3b3b3;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .top__links {
    display: flex;
    flex-direction: column;
    .logo {
      text-align: center;
      margin: 1rem 0;
      img {
        max-width: 80%; 
        height: auto; 
        object-fit: contain; 
        margin: 0 auto; 
      }
    }
    ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      li {
        display: flex;
        justify-content: space-between; /* Để tạo khoảng cách giữa tên và nút */
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover {
          color: white;
        }
        .library {
          position: relative;
          button {
            background-color: #1db954;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            border-radius: 50%;
            padding: 0.2rem 0.5rem;
            &:hover {
              background-color: #1ed760;
            }
          }
        }
      }
    }
  }
`;
