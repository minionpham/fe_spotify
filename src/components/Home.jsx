import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useStateProvider } from "../utils/StateProvider";

export default function Home() {
  const [{ token }, dispatch] = useStateProvider();
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  useEffect(() => {
    const fetchFeaturedPlaylists = async () => {
      try {
        const response = await axios.get(
          "https://api.spotify.com/v1/browse/featured-playlists",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setFeaturedPlaylists(response.data.playlists.items);
      } catch (error) {
        console.error("Error fetching featured playlists:", error);
      }
    };

    const fetchRecentlyPlayed = async () => {
      try {
        const response = await axios.get(
          "https://api.spotify.com/v1/me/player/recently-played",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setRecentlyPlayed(response.data.items);
      } catch (error) {
        console.error("Error fetching recently played:", error);
      }
    };

    fetchFeaturedPlaylists();
    fetchRecentlyPlayed();
  }, [token]);

  const handlePlaylistClick = (playlistId) => {
    dispatch({
      type: "SET_SELECTED_PLAYLIST_ID",
      selectedPlaylistId: playlistId,
    });
  };

  const handleTrackClick = (trackId) => {
    dispatch({
      type: "SET_SELECTED_TRACK_ID",
      selectedTrackId: trackId,
    });
  };

  return (
    <Container>
      <Section>
        <h2>Featured Playlists</h2>
        <PlaylistGrid>
          {featuredPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              onClick={() => handlePlaylistClick(playlist.id)}
            >
              {playlist.images && playlist.images.length > 0 ? (
                <img src={playlist.images[0].url} alt={playlist.name} />
              ) : (
                <img src="default-image-url.jpg" alt="Default" />
              )}
              <h3>{playlist.name}</h3>
              <p>{playlist.description}</p>
            </PlaylistCard>
          ))}
        </PlaylistGrid>
      </Section>

      <Section>
        <h2>Recently Played</h2>
        <PlaylistGrid>
          {recentlyPlayed.map((track) => (
            <PlaylistCard
              key={track.track.id + "-" + track.played_at}
              onClick={() => handleTrackClick(track.track.id)}
            >
              {track.track.album.images && track.track.album.images.length > 0 ? (
                <img src={track.track.album.images[0].url} alt={track.track.name} />
              ) : (
                <img src="default-image-url.jpg" alt="Default" />
              )}
              <h3>{track.track.name}</h3>
              <p>{track.track.artists.map((artist) => artist.name).join(", ")}</p>
            </PlaylistCard>
          ))}
        </PlaylistGrid>
      </Section>
    </Container>
  );
}

const Container = styled.div`
  padding: 2rem;
  color: white;
`;

const Section = styled.div`
  margin-bottom: 3rem;
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
`;

const PlaylistCard = styled.div`
  background-color: #333;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
  }

  img {
    width: 100%;
    height: 150px;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }
  h3 {
    font-size: 1rem;
    margin: 0.5rem 0;
  }
  p {
    font-size: 0.875rem;
    color: #ccc;
  }
`;
