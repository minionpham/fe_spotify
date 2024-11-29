import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";

export default function Home() {
  const [{ token }, dispatch] = useStateProvider();
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0); // For playlists

  useEffect(() => {
    const fetchTopSongs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/songs");
        const songData = response.data;

        const updatedSongs = await Promise.all(
          songData.map(async (song) => {
            try {
              const trackResponse = await axios.get(
                `https://api.spotify.com/v1/tracks/${song.ID}`,
                {
                  headers: {
                    Authorization: "Bearer " + token,
                  },
                }
              );
              const imageUrl =
                trackResponse.data.album.images[0]?.url ||
                "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png"; // Fallback image
              return { ...song, imageUrl };
            } catch (error) {
              console.error("Error fetching song image:", error);
              return {
                ...song,
                imageUrl:
                  "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png", // Fallback image
              };
            }
          })
        );

        setSongs(updatedSongs);
      } catch (error) {
        console.error("Error fetching top songs:", error);
      }
    };

    fetchTopSongs();
  }, [token]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        setPlaylists(response.data.items);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchPlaylists();
  }, [token]);

  const handleNextSong = () => {
    if (currentSongIndex + 5 < songs.length) {
      setCurrentSongIndex(currentSongIndex + 5);
    }
  };

  const handlePrevSong = () => {
    if (currentSongIndex - 5 >= 0) {
      setCurrentSongIndex(currentSongIndex - 5);
    }
  };

  const handleNextPlaylist = () => {
    if (currentPlaylistIndex + 5 < playlists.length) {
      setCurrentPlaylistIndex(currentPlaylistIndex + 5);
    }
  };

  const handlePrevPlaylist = () => {
    if (currentPlaylistIndex - 5 >= 0) {
      setCurrentPlaylistIndex(currentPlaylistIndex - 5);
    }
  };

  const handlePlaySong = async (song) => {
    try {
      const trackResponse = await axios.get(
        `https://api.spotify.com/v1/tracks/${song.ID}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const selectedTrack = {
        id: trackResponse.data.id,
        name: trackResponse.data.name,
        artists: trackResponse.data.artists
          .map((artist) => artist.name)
          .join(", "),
        image:
          trackResponse.data.album.images[0]?.url ||
          "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png", // Fallback image
        duration: trackResponse.data.duration_ms,
        album: trackResponse.data.album.name,
        context_uri: trackResponse.data.album.uri,
        track_number: trackResponse.data.track_number,
        uri: trackResponse.data.uri,
      };

      dispatch({
        type: "SET_SELECTED_TRACK",
        selectedTrack,
      });

      await axios.put(
        `https://api.spotify.com/v1/me/player/play`,
        {
          uris: [selectedTrack.uri],
        },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
    } catch (error) {
      console.error("Error playing the song:", error);
    }
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
  
  return (
    <Container>
      {/* Top Songs Row */}
      <Title>Viet Nam Top Songs Today</Title>
      <SongsWrapper>
        <NavButtonWrapper left>
          <NavButton onClick={handlePrevSong} disabled={currentSongIndex === 0}>
            &lt;
          </NavButton>
        </NavButtonWrapper>
        <SongCardsWrapper>
          {songs.slice(currentSongIndex, currentSongIndex + 5).map((song) => (
            <SongCard key={song.ID} onClick={() => handlePlaySong(song)}>
              <SongImage src={song.imageUrl} alt={song.Name} />
              <SongDetails>
                <SongName>{song.Name}</SongName>
                <ArtistName>{song.Artist}</ArtistName>
              </SongDetails>
            </SongCard>
          ))}
        </SongCardsWrapper>
        <NavButtonWrapper right>
          <NavButton
            onClick={handleNextSong}
            disabled={currentSongIndex + 5 >= songs.length}
          >
            &gt;
          </NavButton>
        </NavButtonWrapper>
      </SongsWrapper>

      {/* Playlists Row */}
      <Title marginTop="60px">Your Playlists</Title>
      <PlaylistsWrapper>
        <NavButtonWrapper left>
          <NavButton
            onClick={handlePrevPlaylist}
            disabled={currentPlaylistIndex === 0}
          >
            &lt;
          </NavButton>
        </NavButtonWrapper>
        <PlaylistCardsWrapper>
          {playlists
            .slice(currentPlaylistIndex, currentPlaylistIndex + 5)
            .map((playlist) => (
              <PlaylistCard key={playlist.id} onClick={() => changeCurrentPlaylist(playlist.id)}>
                <PlaylistImage
                  src={playlist.images[0]?.url || "fallback-image-url"}
                  alt={playlist.name}
                />
                <PlaylistName>{playlist.name}</PlaylistName>
              </PlaylistCard>
            ))}
        </PlaylistCardsWrapper>
        <NavButtonWrapper right>
          <NavButton
            onClick={handleNextPlaylist}
            disabled={currentPlaylistIndex + 5 >= playlists.length}
          >
            &gt;
          </NavButton>
        </NavButtonWrapper>
      </PlaylistsWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #121212 0%, #1a1a1a 100%);
  color: white;
  padding: 3rem;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
`;

const Title = styled.h2`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 40px;
  margin-top: ${(props) => props.marginTop || "0"};  
  text-align: center;
  color: #f5f5f5;
`;

const SongsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
`;

const SongCardsWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  overflow: hidden;
  width: 100%;
  justify-content: center;
  transition: transform 0.5s ease-in-out;
`;

const SongCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #2e2e2e;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 200px;
  cursor: pointer;
  overflow: hidden;
  height: 300px; /* Fixed height for consistency */

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  }
`;

const SongDetails = styled.div`
  margin-top: 15px;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SongName = styled.p`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ArtistName = styled.p`
  font-size: 14px;
  color: #b0b0b0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SongImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 10px;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const NavButtonWrapper = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => (props.left ? 'left: -20px;' : 'right: -20px;')}
  z-index: 10;
`;

const NavButton = styled.button`
  background-color: #4c4c4c;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  transition: background-color 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
  margin: 0 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  opacity: ${(props) => (props.disabled ? "0" : "0.5")}; /* Make invisible when disabled */
  visibility: ${(props) => (props.disabled ? "hidden" : "visible")}; /* Hide completely when disabled */

  &:disabled {
    background-color: #888;
    cursor: not-allowed;
    opacity: 0;  /* Fully invisible when disabled */
    visibility: hidden; /* Hide the button completely */
  }

  &:hover:not(:disabled) {
    background-color: #1db954;
    transform: scale(1.1);
    opacity: 1;
  }
`;

const PlaylistsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
`;

const PlaylistCardsWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  overflow: hidden;
  width: 100%;
  justify-content: center;
  transition: transform 0.5s ease-in-out;
`;

const PlaylistCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #2e2e2e;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 200px;
  cursor: pointer;
  overflow: hidden;
  height: 250px; /* Fixed height for consistency */

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  }
`;

const PlaylistImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 10px;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const PlaylistName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-top: 15px;
  margin-bottom: 5px;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;


