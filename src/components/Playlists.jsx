import axios from "axios";
import React, { useEffect } from "react";
import styled from "styled-components";
import { reducerCases } from "../utils/Constants";
import { useStateProvider } from "../utils/StateProvider";

export default function Playlists({ showCreateInput, onCreateSuccess }) {
  const [
    { token, playlists, userInfo, newPlaylistName, contextMenu, selectedPlaylistId },
    dispatch,
  ] = useStateProvider();

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
      const playlists = items.map(({ name, id }) => {
        return { name, id };
      });
      dispatch({ type: reducerCases.SET_PLAYLISTS, playlists });
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
    const createdPlaylist = { name: response.data.name, id: response.data.id };
    dispatch({
      type: reducerCases.SET_PLAYLISTS,
      playlists: [...playlists, createdPlaylist],
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
    if (response.data.items.length === 0) {
      alert("Playlist này rỗng!");
    }
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
      <ul className="playlist-list">
        {playlists.map(({ name, id }) => (
          <li
            key={id}
            onClick={() => changeCurrentPlaylist(id)}
            onContextMenu={(e) => handleRightClick(e, id)}
          >
            {name}
          </li>
        ))}
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
    max-height: 300px; /* Giới hạn chiều cao của danh sách playlist */
    overflow-y: auto; /* Bật tính năng cuộn khi danh sách vượt quá chiều cao */
    &::-webkit-scrollbar {
      width: 0.7rem;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.6);
      border-radius: 10px;
    }
    li {
      transition: 0.3s ease-in-out;
      cursor: pointer;
      &:hover {
        color: white;
      }
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
