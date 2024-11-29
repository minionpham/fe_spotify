import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useStateProvider } from "../utils/StateProvider";

export default function Home() {
  const [{ token }, dispatch] = useStateProvider();
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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
                "default_image_url_here.jpg";
              return { ...song, imageUrl };
            } catch (error) {
              console.error("Error fetching song image:", error);
              return {
                ...song,
                imageUrl: "default_image_url_here.jpg",
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

  const handleNext = () => {
    if (currentIndex + 5 < songs.length) {
      setCurrentIndex(currentIndex + 5);
    }
  };

  const handlePrev = () => {
    if (currentIndex - 5 >= 0) {
      setCurrentIndex(currentIndex - 5);
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
          trackResponse.data.album.images[0]?.url || "default_image_url_here.jpg",
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

  return (
    <Container>
      <Title>Viet Nam Top Songs Today</Title>
      <SongsWrapper>
        <NavButtonWrapper left>
          <NavButton onClick={handlePrev} disabled={currentIndex === 0}>
            &lt;
          </NavButton>
        </NavButtonWrapper>
        <SongCardsWrapper>
          {songs.slice(currentIndex, currentIndex + 5).map((song) => (
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
          <NavButton onClick={handleNext} disabled={currentIndex + 5 >= songs.length}>
            &gt;
          </NavButton>
        </NavButtonWrapper>
      </SongsWrapper>
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
  flex-grow: 1; /* Allow text to grow but won't stretch the card */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SongName = styled.p`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #fff;
  display: -webkit-box; /* Use flexbox to manage text wrapping */
  -webkit-line-clamp: 2; /* Limit the text to two lines */
  -webkit-box-orient: vertical; /* Ensure text wraps vertically */
  overflow: hidden; /* Hide overflowing text */
  text-overflow: ellipsis; /* Show ellipsis when text overflows */
`;

const ArtistName = styled.p`
  font-size: 14px;
  color: #b0b0b0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Handle overflow if the artist name is too long */
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
  opacity: 0.5; /* Make it more transparent by default */

  &:disabled {
    background-color: #888;
    cursor: not-allowed;
    opacity: 0.5; /* Ensure the opacity is consistent when disabled */
  }

  &:hover:not(:disabled) {
    background-color: #1DB954;
    transform: scale(1.1);
    opacity: 1; /* Increase opacity when hovered */
  }

  &:active:not(:disabled) {
    background-color: #444;
  }
`;
