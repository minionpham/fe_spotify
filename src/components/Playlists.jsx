import axios from "axios";
import React, { useEffect } from "react";
import styled from "styled-components";
import { reducerCases } from "../utils/Constants";
import { useStateProvider } from "../utils/StateProvider";

export default function Playlists() {
  const [{ token, playlists, userInfo, newPlaylistName }, dispatch] = useStateProvider();

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
  }, [token, dispatch]);

  const createPlaylist = async () => {
    if (newPlaylistName.trim() === "") return; // Kiểm tra nếu tên trống
    const response = await axios.post(
      `https://api.spotify.com/v1/users/${userInfo.userId}/playlists`, // Thêm userId vào API
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
      playlists: [...playlists, createdPlaylist], // Thêm playlist mới vào danh sách
    });
    dispatch({ type: reducerCases.SET_NEW_PLAYLIST_NAME, newPlaylistName: "" }); // Reset tên sau khi tạo
  };

  const handlePlaylistNameChange = (e) => {
    dispatch({
      type: reducerCases.SET_NEW_PLAYLIST_NAME,
      newPlaylistName: e.target.value, // Cập nhật tên playlist qua dispatch
    });
  };

  const changeCurrentPlaylist = (selectedPlaylistId) => {
    dispatch({ type: reducerCases.SET_PLAYLIST_ID, selectedPlaylistId });
  };

  return (
    <Container>
      <div className="create-playlist">
        <input
          type="text"
          placeholder="Enter playlist name"
          value={newPlaylistName}
          onChange={handlePlaylistNameChange} // Gọi hàm thay đổi tên playlist
        />
        <button onClick={createPlaylist}>Create Playlist</button>
      </div>
      <ul>
        {playlists.map(({ name, id }) => {
          return (
            <li key={id} onClick={() => changeCurrentPlaylist(id)}>
              {name}
            </li>
          );
        })}
      </ul>
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

  ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    height: 55vh;
    max-height: 100%;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.7rem;
      &-thumb {
        background-color: rgba(255, 255, 255, 0.6);
      }
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
