import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";

export default function Recommend() {
  const [{ token, currentPlaying }, dispatch] = useStateProvider();
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [recentlyPlayedRecommendations, setRecentlyPlayedRecommendations] = useState([]);
  const [currentSongName, setCurrentSongName] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentPlaying) return;

      setCurrentSongName(currentPlaying.name);

      try {
        const response = await axios.post("http://127.0.0.1:5000/api/recommendations", {
          song_id: currentPlaying.id
        }, {
          headers: {
            Authorization: "Bearer " + token
          }
        });

        const songIds = response.data;
        const detailedSongs = await Promise.all(
          songIds.map(async (songId) => {
            const songResponse = await axios.get(`https://api.spotify.com/v1/tracks/${songId}?market=vn`, {
              headers: {
                Authorization: "Bearer " + token
              }
            });
            return songResponse.data;
          })
        );
        setRecommendedSongs(detailedSongs);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
  }, [token, currentPlaying]);

  useEffect(() => {
    const fetchRecommendationsListened = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/recommendations_listened", {
          headers: {
            Authorization: "Bearer " + token
          }
        });

        const songIds = response.data;
        const detailedSongs = await Promise.all(
          songIds.map(async (songId) => {
            const songResponse = await axios.get(`https://api.spotify.com/v1/tracks/${songId}?market=vn`, {
              headers: {
                Authorization: "Bearer " + token
              }
            });
            return songResponse.data;
          })
        );
        setRecentlyPlayedRecommendations(detailedSongs);
      } catch (error) {
        console.error("Error fetching recently listened recommendations:", error);
      }
    };

    fetchRecommendationsListened();
  }, [token]);

  const playRecommendedSong = async (id, name, artists, image, context_uri, track_number) => {
    const response = await axios.put(
      `https://api.spotify.com/v1/me/player/play`,
      {
        context_uri,
        offset: {
          position: track_number - 1,
        },
        position_ms: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    if (response.status === 204) {
      const currentPlaying = {
        id,
        name,
        artists,
        image,
      };
      dispatch({ type: reducerCases.SET_PLAYING, currentPlaying });
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    } else {
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    }
  };

  return (
    <MainContainer>
      <SectionContainer>
        <Section>
          <h2>Tương tự {currentSongName}</h2>
          <TracksContainer>
            {recommendedSongs.map((song, index) => (
              <Track key={index} onClick={() => playRecommendedSong(song.id, song.name, song.artists, song.album.images[0].url, song.album.uri, song.track_number)}>
                <div className="image">
                  <img src={song.album.images[0].url} alt={song.name} />
                </div>
                <div className="detail">
                  <div className="info">
                    <h3>{song.name}</h3>
                    <p>{song.artists.map(artist => artist.name).join(", ")}</p>
                  </div>
                </div>
              </Track>
            ))}
          </TracksContainer>
        </Section>
      </SectionContainer>
      <SectionContainer>
        <Section>
          <h2>Có thể bạn muốn nghe</h2>
          <TracksContainer>
            {recentlyPlayedRecommendations.map((song, index) => (
              <Track key={index} onClick={() => playRecommendedSong(song.id, song.name, song.artists, song.album.images[0].url, song.album.uri, song.track_number)}>
                <div className="image">
                  <img src={song.album.images[0].url} alt={song.name} />
                </div>
                <div className="detail">
                  <div className="info">
                    <h3>{song.name}</h3>
                    <p>{song.artists.map(artist => artist.name).join(", ")}</p>
                  </div>
                </div>
              </Track>
            ))}
          </TracksContainer>
        </Section>
      </SectionContainer>
    </MainContainer>
  );
}

const MainContainer = styled.div`
  background-color: transparent;
  color: white;
  padding: 10px;
`;

const SectionContainer = styled.div`
  background-color: #292929;
  margin-bottom: 40px;
  padding: 20px;
  border-radius: 10px;
  
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const Section = styled.div`
  h2 {
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
`;

const TracksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const Track = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  max-width: 400px;
  background-color: #2c2c2c;
  border-radius: 10px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .image {
    margin-right: 10px;
    img {
      height: 60px;
      width: 60px;
      box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
      border-radius: 10px;
    }
  }

  .detail {
    flex: 1;

    .info {
      h3, p {
        margin: 0;
      }
      h3 {
        font-size: 1.1em;
        margin-bottom: 5px;
      }
      p {
        font-size: 0.9em;
        color: #b3b3b3;
      }
    }
  }
`;
