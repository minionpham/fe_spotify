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

    const fetchNewReleases = async () => {
      try {
        const response = await axios.get(
          "https://api.spotify.com/v1/browse/new-releases",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setNewReleases(response.data.albums.items);
      } catch (error) {
        console.error("Error fetching new releases:", error);
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
    fetchNewReleases();
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

  const scrollHorizontally = (id, direction) => {
    const container = document.getElementById(id);
    const scrollAmount = direction === "left" ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <Container>
      <Section>
        <h2>Featured Playlists</h2>
        <ScrollWrapper>
          <button onClick={() => scrollHorizontally("featuredPlaylists", "left")}>
            {"<"}
          </button>
          <PlaylistRow id="featuredPlaylists">
            {featuredPlaylists.map((playlist) => (
              <Card
                key={playlist.id}
                onClick={() => handlePlaylistClick(playlist.id)}
              >
                <img
                  src={
                    playlist.images?.[0]?.url || "default-image-url.jpg"
                  }
                  alt={playlist.name}
                />
                <h3>{playlist.name}</h3>
              </Card>
            ))}
          </PlaylistRow>
          <button onClick={() => scrollHorizontally("featuredPlaylists", "right")}>
            {">"}
          </button>
        </ScrollWrapper>
      </Section>

      <Section>
        <h2>New Releases</h2>
        <ScrollWrapper>
          <button onClick={() => scrollHorizontally("newReleases", "left")}>
            {"<"}
          </button>
          <PlaylistRow id="newReleases">
            {newReleases.map((album) => (
              <Card key={album.id}>
                <img
                  src={album.images?.[0]?.url || "default-image-url.jpg"}
                  alt={album.name}
                />
                <h3>{album.name}</h3>
              </Card>
            ))}
          </PlaylistRow>
          <button onClick={() => scrollHorizontally("newReleases", "right")}>
            {">"}
          </button>
        </ScrollWrapper>
      </Section>

      <Section>
        <h2>Recently Played</h2>
        <ScrollWrapper>
          <button onClick={() => scrollHorizontally("recentlyPlayed", "left")}>
            {"<"}
          </button>
          <PlaylistRow id="recentlyPlayed">
            {recentlyPlayed.map((track) => (
              <Card key={track.track.id + "-" + track.played_at}>
                <img
                  src={
                    track.track.album.images?.[0]?.url ||
                    "default-image-url.jpg"
                  }
                  alt={track.track.name}
                />
                <h3>{track.track.name}</h3>
              </Card>
            ))}
          </PlaylistRow>
          <button onClick={() => scrollHorizontally("recentlyPlayed", "right")}>
            {">"}
          </button>
        </ScrollWrapper>
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

const ScrollWrapper = styled.div`
  display: flex;
  align-items: center;

  button {
    background: none;
    color: white;
    border: 1px solid white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    margin: 0 1rem;
    transition: 0.2s ease;

    &:hover {
      background: white;
      color: black;
    }
  }
`;

const PlaylistRow = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 1.5rem;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Card = styled.div`
  background-color: #333;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  min-width: 150px;
  flex-shrink: 0;
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
`;
