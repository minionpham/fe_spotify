import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { reducerCases } from "../utils/Constants";
import { useStateProvider } from "../utils/StateProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export default function Playlists({ showCreateInput, onCreateSuccess }) {
  const [
    { token, playlists, userInfo, newPlaylistName, contextMenu, selectedPlaylistId },
    dispatch,
  ] = useStateProvider();
  const [searchTerm, setSearchTerm] = useState(""); // Thêm state để lưu từ khóa tìm kiếm
  const [isSearchVisible, setSearchVisible] = useState(false); // Quản lý hiển thị searchbar

  useEffect(() => {
    const getPlaylistData = async () => {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/playlists",
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      const { items } = response.data;

      // Lấy track data cho từng playlist và lưu ảnh album
      const playlistsWithImages = await Promise.all(
        items.map(async ({ name, id }) => {
          const tracksResponse = await axios.get(
            `https://api.spotify.com/v1/playlists/${id}/tracks`,
            {
              headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
              },
            }
          );
          const firstTrack = tracksResponse.data.items[0];
          const albumImage = firstTrack?.track?.album?.images[2]?.url; // Lấy ảnh album
          return { name, id, image: albumImage }; // Lưu ảnh album cho playlist
        })
      );
      
      dispatch({ type: reducerCases.SET_PLAYLISTS, playlists: playlistsWithImages });
    };

    getPlaylistData();

    const handleClickOutside = () => dispatch({ type: reducerCases.SET_CONTEXT_MENU, contextMenu: null });
    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, [token, dispatch]);

  const createPlaylist = async () => {
    if (newPlaylistName.trim() === "") return;
  
    const response = await axios.post(
      `https://api.spotify.com/v1/users/${userInfo.userId}/playlists`,
      {
        name: newPlaylistName,
        description: "New playlist created via Spotify Clone",
        public: false,
      },
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );
  
    const createdPlaylist = {
      name: response.data.name,
      id: response.data.id,
      image: response.data.images?.length > 0
      ? response.data.images[0].url
      : "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png",
    };
  
    // Thêm playlist mới lên đầu danh sách
    dispatch({
      type: reducerCases.SET_PLAYLISTS,
      playlists: [createdPlaylist, ...playlists], // Thêm playlist mới lên đầu
    });
  
    dispatch({ type: reducerCases.SET_NEW_PLAYLIST_NAME, newPlaylistName: "" });
    onCreateSuccess();
  };
  
  const handlePlaylistNameChange = (e) => {
    dispatch({
      type: reducerCases.SET_NEW_PLAYLIST_NAME,
      newPlaylistName: e.target.value,
    });
  };

  const changeCurrentPlaylist = async (id) => {
    dispatch({ type: reducerCases.SET_PLAYLIST_ID, selectedPlaylistId: id });

    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${id}/tracks`,
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );
    // if (response.data.items.length === 0) {
    //   alert("Playlist này rỗng!");
    // }
  };

  const handleRightClick = (event, id) => {
    event.preventDefault();
    dispatch({
      type: reducerCases.SET_CONTEXT_MENU,
      contextMenu: { x: event.clientX, y: event.clientY },
    });
    dispatch({
      type: reducerCases.SET_SELECTED_PLAYLIST_ID,
      selectedPlaylistId: id,
    });
  };

  const deletePlaylist = async () => {
    if (selectedPlaylistId) {
      await axios.delete(
        `https://api.spotify.com/v1/playlists/${selectedPlaylistId}/followers`,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      dispatch({
        type: reducerCases.SET_PLAYLISTS,
        playlists: playlists.filter((playlist) => playlist.id !== selectedPlaylistId),
      });
    }
    dispatch({ type: reducerCases.SET_CONTEXT_MENU, contextMenu: null });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const toggleSearchBar = () => setSearchVisible((prev) => !prev);
  return (
    <Container>
      {showCreateInput && (
        <div className="create-playlist">
          <input
            type="text"
            placeholder="Enter playlist name"
            value={newPlaylistName}
            onChange={handlePlaylistNameChange}
          />
          <button onClick={createPlaylist}>Create Playlist</button>
        </div>
      )}
      <div className="search-container">
        <button className="search-button" onClick={toggleSearchBar}>
        <FontAwesomeIcon icon={faSearch} />
        </button>
        {isSearchVisible && (
          <input
            type="text"
            className="search-bar"
            placeholder="Search playlists..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        )}
      </div>
      
      <ul className="playlist-list">
      {filteredPlaylists.length > 0 ? (
          filteredPlaylists.map(({ name, id, image }) => (
            <li
              key={id}
              onClick={() => changeCurrentPlaylist(id)}
              onContextMenu={(e) => handleRightClick(e, id)}
            >
              <img src={image || "defaultImageUrl"} alt="album" className="playlist-image" />
              {name}
            </li>
          ))
        ) : (
          <div className="empty-message">No playlists found. Try another search!</div>
        )}
      </ul>

      {contextMenu && (
        <ContextMenu
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={deletePlaylist}
        >
          Delete Playlist
        </ContextMenu>
      )}
    </Container>
  );
}

const Container = styled.div`
  color: #b3b3b3;
  height: 100%;
  overflow: hidden;
 
  .search-container {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    padding: 1rem;

    .search-button {
    border: none; 
    border-radius: 3px; 
    padding: 0.4rem; 
}
    .search-bar {
      flex: 1;
      width: 100px;
      padding: 0.4rem;
      border-radius: 4px;
      border: none;
      outline: none;
      display: inline-block;
      animation: fadeIn 0.3s ease-in-out;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
      .empty-message {
    text-align: center;
    color: #b3b3b3;
    margin: 2rem 0;
    font-size: 1.2rem;
  }

  .create-playlist {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    input {
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      outline: none;
    }
    button {
      padding: 0.5rem;
      background-color: #1db954;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: 0.3s ease-in-out;
      &:hover {
        background-color: #1ed760;
      }
    }
  }

  .playlist-list {
    list-style-type: none;
    padding: 1rem;
    max-height: 300px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 0.7rem;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.6);
      border-radius: 10px;
    }
    li {
      display: flex;
      align-items: center;
      gap: 1.5rem;  /* Tăng khoảng cách giữa các playlist */
      transition: 0.3s ease-in-out;
      cursor: pointer;
      &:hover {
        color: white;
      }
      .playlist-image {
        width: 50px;  /* Tăng kích thước ảnh playlist */
        height: 50px;
        border-radius: 4px;
        object-fit: cover;
      }
    }
  }
  .empty-playlist {
  margin: 2rem;
  text-align: center;
  color: #b3b3b3;
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #fff;
  }
  p {
    font-size: 1.2rem;
  }
}
`;

const ContextMenu = styled.div`
  position: absolute;
  background-color: #333;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  &:hover {
    background-color: #444;
  }
`;
