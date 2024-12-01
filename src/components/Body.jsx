import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { useStateProvider } from "../utils/StateProvider";
import { AiFillClockCircle } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { reducerCases } from "../utils/Constants";
import Home from "./Home"; // Import Home component

export default function Body({ headerBackground }) {
  const [{ token, selectedPlaylist, selectedPlaylistId, playlists, selectedTrack }, dispatch] =
    useStateProvider();
  const [showDropdown, setShowDropdown] = useState(null);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(null); // State for playlist dropdown
  const dropdownRef = useRef(null);

  // Reset `selectedPlaylist` khi `selectedPlaylistId` thay đổi
  useEffect(() => {
    dispatch({ type: reducerCases.SET_PLAYLIST, selectedPlaylist: null });
    const getInitialPlaylist = async () => {
      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/playlists/${selectedPlaylistId}`,
          {
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
          }
        );
    
        const playlistData = response.data;
    
        // Kiểm tra dữ liệu trả về
        if (!playlistData) {
          console.error("Playlist data is null or undefined!");
          return;
        }
        const playlistImage = playlistData.images?.[0]?.url || ""; // Dùng URL rỗng nếu không có ảnh
        const playlistTracks = playlistData.tracks?.items || []; // Dùng mảng rỗng nếu không có bài hát
    
        const selectedPlaylist = {
          id: playlistData.id,
          name: playlistData.name,
          description: playlistData.description.startsWith("<a")
            ? ""
            : playlistData.description,
          image: playlistImage,
          tracks: playlistTracks.map(({ track }) => ({
            id: track?.id,
            name: track?.name,
            artists: track?.artists.map((artist) => artist.name) || [],
            image: track?.album?.images?.[2]?.url || "", // Dùng URL rỗng nếu không có ảnh album
            duration: track?.duration_ms,
            album: track?.album?.name || "",
            context_uri: track?.album?.uri,
            track_number: track?.track_number,
            uri: track?.uri,
          })),
        };
    
        dispatch({ type: reducerCases.SET_PLAYLIST, selectedPlaylist });
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };
    if (selectedPlaylistId) getInitialPlaylist();
  }, [token, dispatch, selectedPlaylistId]);


  // Xử lý đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
        setShowPlaylistDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleAddToPlaylist = async (trackId, playlistId) => {
    try {
      // Lấy thông tin playlist hiện tại
      const playlistResponse = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      // Kiểm tra nếu playlist không tồn tại hoặc không có tracks
      if (!playlistResponse.data || !playlistResponse.data.tracks || !playlistResponse.data.tracks.items) {
        console.error("Playlist hoặc danh sách bài hát không tồn tại!");
        alert("Không thể lấy thông tin danh sách phát.");
        return;
      }
    // Kiểm tra xem bài hát đã tồn tại trong playlist chưa
      const trackExists = playlistResponse.data.tracks.items.some(
        (item) => item.track.id === trackId
      );

      if (trackExists) {
        alert("Bài hát đã có trong danh sách phát!");
        return; // Thoát nếu bài hát đã tồn tại
      }
    // Thêm bài hát vào playlist
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

    // Cập nhật lại danh sách các playlist
    await new Promise((resolve) => setTimeout(resolve, 500)); // Đợi API cập nhật
    const playlistsResponse = await axios.get(
      `https://api.spotify.com/v1/me/playlists`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Tạo danh sách các playlist đã cập nhật
    const updatedPlaylists = playlistsResponse.data.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      image: playlist.images?.[0]?.url || "", // Kiểm tra kỹ hình ảnh trước khi truy cập
    }));

    // Cập nhật state danh sách playlist
    dispatch({ type: reducerCases.SET_PLAYLISTS, playlists: updatedPlaylists });
  } catch (error) {
    console.error("Error adding track to playlist:", error);
    alert("Đã xảy ra lỗi khi thêm bài hát vào danh sách phát.");
  } finally {
    setShowPlaylistDropdown(null); // Đóng dropdown sau khi hoàn thành
  }
};

const handleRemoveFromPlaylist = async (trackId) => {
  try {
    // Kiểm tra nếu playlist ID và track ID tồn tại
    if (!selectedPlaylistId || !trackId) {
      console.error("Playlist ID hoặc Track ID không tồn tại!");
      return;

    
      }
    // Xóa bài hát khỏi playlist qua API Spotify
    await axios.delete(
      `https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks`,
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        data: {
          tracks: [{ uri: `spotify:track:${trackId}` }],
        },
      }
    );

    // Đợi API cập nhật dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Lấy thông tin playlist đang chọn
    const playlistResponse = await axios.get(
      `https://api.spotify.com/v1/playlists/${selectedPlaylistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Cập nhật danh sách track của playlist đang chọn
    const updatedTracks =
      playlistResponse.data.tracks.items.map((item) => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map((artist) => artist.name).join(", "),
        image: item.track.album.images?.[0]?.url || "", // Hình ảnh của bài hát
      })) || [];

    // Nếu playlist rỗng, đặt hình ảnh mặc định hoặc trống
    const updatedImage =
      updatedTracks.length > 0
        ? updatedTracks[0].image
        : ""; // Playlist rỗng thì không có ảnh

    // Cập nhật playlist đang chọn trong state
    dispatch({
      type: reducerCases.SET_PLAYLIST,
      selectedPlaylist: {
        ...selectedPlaylist,
        tracks: updatedTracks,
        image: updatedImage,
        },
      });
  
      // Cập nhật danh sách các playlist
      const playlistsResponse = await axios.get(
        `https://api.spotify.com/v1/me/playlists`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const updatedPlaylists = playlistsResponse.data.items.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        image: playlist.images?.[0]?.url || "",
      }));
  
      dispatch({ type: reducerCases.SET_PLAYLISTS, playlists: updatedPlaylists });
  
      console.log("Track removed and playlist updated successfully!");
      alert("Đã xóa bài hát khỏi danh sách phát!");
    } catch (error) {
      console.error("Error removing track from playlist:", error);
      alert("Đã xảy ra lỗi khi xóa bài hát khỏi danh sách phát.");
    } finally {
      setShowPlaylistDropdown(null); // Đóng dropdown sau khi hoàn thành
    }
  };

    

  const msToMinutesAndSeconds = (ms) => {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  const handleAddToQueue = (selectedPlaylistId) =>{
    // 

  }
  useEffect(() =>{}
  ,[selectedTrack])

  return (
    <Container headerBackground={headerBackground}>
      {showDropdown && <div className="overlay" onClick={() => setShowDropdown(null)} />}
      {showPlaylistDropdown && <div className="overlay" onClick={() => setShowPlaylistDropdown(null)} />}
      
      {selectedPlaylist ? (
        <>
          <div className="playlist">
            <div className="image">
              <img src={selectedPlaylist.image} alt="selected playlist" />
            </div>
            <div className="details">
              <span className="type">PLAYLIST</span>
              <h1 className="title">{selectedPlaylist.name}</h1>
              <p className="description">{selectedPlaylist.description}</p>
            </div>
          </div>
          {/* Kiểm tra nếu playlist rỗng */}
        {selectedPlaylist.tracks.length === 0 ? (
          <div className="empty-playlist">
            <h2>Playlist của bạn đang trống</h2>
            <p>Hãy thêm bài hát vào để bắt đầu nghe nhạc!</p>
          </div>
        ) : (
          <div className="list">
            <div className="header-row">
              <div className="col">
                <span>#</span>
              </div>
              <div className="col">
                <span>TITLE</span>
              </div>
              <div className="col">
                <span>ALBUM</span>
              </div>
              <div className="col">
                <span>
                  <AiFillClockCircle />
                </span>
              </div>
            </div>
            <div className="tracks">
              {selectedPlaylist.tracks.map(
                (
                  {
                    id,
                    name,
                    artists,
                    image,
                    duration,
                    album,
                    context_uri,
                    track_number,
                    uri
                  },
                  index
                ) => (
                  <div className="row"
                  key={id}
                  onClick={() => {// xu li su kien khi bam vao 1 track va add queue selectedPlaylistId  
                    const selectedTrack = {id, name, artists, image, duration, album, context_uri, track_number, uri}
                    dispatch({ type: reducerCases.SET_SELECTED_TRACK, selectedTrack });    

                    // add queue

                    // for(let i= index; i< selectedPlaylist.tracks.length; i++) {
                    //   const track = selectedPlaylist.tracks[i];
                    //   const addToQueue = async (uri) => {
                    //     try {
                    //       const response = await axios.post(
                    //         `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,
                    //         {},
                    //         {
                    //           headers: {
                    //             "Content-Type": "application/json",
                    //             Authorization: "Bearer " + token,
                    //           },
                    //         }
                    //       );
                    
                    //       if (response.status === 204) {
                    //         console.log("Track added to the queue successfully!");
                    //       }
                    //     } catch (error) {
                    //       console.error(error);
                    //     }
                    //   };
                    //   addToQueue(track.uri)    
                    // }
                        
                  }}               
                  >
                    <div className="col">
                      <span>{index + 1}</span>
                    </div>
                    <div className="col detail">
                      <div className="image">
                        <img src={image} alt="track" />
                      </div>
                      <div className="info">
                        <span className="name">{name}</span>
                        <span>{artists.join(", ")}</span>
                      </div>
                    </div>
                    <div className="col">
                      <span>{album}</span>
                    </div>
                    <div className="col">
                      <span>{msToMinutesAndSeconds(duration)}</span>
                      <div className="ellipsis-container">
                        <BsThreeDotsVertical
                          className="ellipsis"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropdown(showDropdown === id ? null : id);
                          }}
                        />
                        {showDropdown === id && (
                          <div className="dropdown" ref={dropdownRef}>
                            <div
                              className="dropdown-item"
                              onClick={() => {
                                setShowDropdown(null);
                                setShowPlaylistDropdown(id);
                              }}
                            >
                              Thêm vào danh sách phát
                            </div>
                            <div
                              className="dropdown-item"
                              onClick={() => {
                                setShowDropdown(null);
                                handleRemoveFromPlaylist(id);
                              }}
                            >
                              Xóa khỏi playlist
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        </>
      ) : (
        <Home /> // Show Home component when no playlist is selected
      )}
      
      {showPlaylistDropdown && (
        <div className="playlist-dropdown" ref={dropdownRef}>
          {playlists.map(({ name, id: playlistId }) => (
            <div
              key={playlistId}
              onClick={() => handleAddToPlaylist(showPlaylistDropdown, playlistId)}
              className="dropdown-item"
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
  .playlist {
    margin: 0 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    .image {
      img {
        height: 15rem;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
      }
    }
    .details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      color: #e0dede;
      .title {
        color: white;
        font-size: 4rem;
      }
    }
  }
  .list {
    .header-row {
      display: grid;
      grid-template-columns: 0.3fr 3fr 2fr 0.1fr;
      margin: 1rem 0 0 0;
      color: #dddcdc;
      position: sticky;
      top: 15vh;
      padding: 1rem 3rem;
      transition: 0.3s ease-in-out;
      background-color: ${({ headerBackground }) =>
        headerBackground ? "#000000dc" : "none"};
    }
    .tracks {
      margin: 0 2rem;
      display: flex;
      flex-direction: column;
      margin-bottom: 5rem;
      .row {
        padding: 0.5rem 1rem;
        display: grid;
        grid-template-columns: 0.3fr 3.1fr 2fr 0.1fr;
        &:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
        .col {
          display: flex;
          align-items: center;
          color: #dddcdc;
          img {
            height: 40px;
            width: 40px;
          }
        }
        .detail {
          display: flex;
          gap: 1rem;
          .info {
            display: flex;
            flex-direction: column;
          }
        }
      }
    }
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Black overlay with 50% opacity */
    z-index: 9;
  }

  .ellipsis-container {
    position: relative;
    display: inline-block;
    margin-left: 1rem;
  }

  .ellipsis {
    cursor: pointer;
    font-size: 1.2rem;
    color: #dddcdc;
    &:hover {
      color: #1ed760;
    }
  }

  /* Positioning dropdown to the left of the 3 dots button */
  .dropdown {
    position: absolute; /* Changed from fixed to absolute */
    top: 0;
    left: -150px; /* Adjust position to left of the 3 dots button */
    background-color: #282828;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    padding: 1rem;
    z-index: 10;
    width: 200px;
    text-align: center;
    color: #fff;

    .dropdown-item {
      padding: 10px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      color: #b3b3b3;

      &:hover {
        background-color: #404040;
        color: #fff;
      }
    }
  }

  /* Ensure playlist dropdown is centered */
  .playlist-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #333;
    border-radius: 8px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.5);
    width: 200px;
    padding: 1rem;
    z-index: 10;
    max-height: 300px;
    overflow-y: auto;
    color: #fff;
    text-align: left;

    .dropdown-item {
      padding: 10px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      color: #b3b3b3;

      &:hover {
        background-color: #444;
        color: #fff;
      }
    }
  }
`;