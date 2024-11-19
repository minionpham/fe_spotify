import React, { useState } from "react";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import { reducerCases } from "../utils/Constants";
import { CgProfile } from "react-icons/cg";
import { useStateProvider } from "../utils/StateProvider";
import axios from "axios";

export default function Navbar({ navBackground }) {
  const [{ userInfo }] = useStateProvider();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [{ token }, dispatch] = useStateProvider();
  const [errorMessage, setErrorMessage] = useState(null);


  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track%2Calbum%2Cartist&market=VN&limit=5`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const items = response.data;

      const trackSuggestions = items.tracks.items.map((track) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist) => artist.name),
        image: track.album.images[2]?.url || "",
        context_uri: track.album.uri,
        track_number: track.track_number,
        type: "track",
      }));

      const albumSuggestions = items.albums.items.slice(0, 2).map((album) => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map((artist) => artist.name),
        image: album.images[2]?.url || "",
        context_uri: album.uri,
        type: "album",
        external_urls: album.external_urls,
      }));

      const artistSuggestions = items.artists.items
        .slice(0, 2)
        .map((artist) => ({
          id: artist.id,
          name: artist.name,
          image: artist.images[2]?.url || "",
          type: "artist",
          external_urls: artist.external_urls,
        }));

      setSuggestions([
        ...trackSuggestions,
        ...albumSuggestions,
        ...artistSuggestions,
      ]);

      setErrorMessage(null);
    } catch (error) {
      console.error("Error fetching: ", error);

      if (error.response?.status === 401) {
        setErrorMessage("Token expired. Please log in again.");
      } else if (error.response?.status === 403) {
        setErrorMessage(
          "Authorization failed. Please check your token and permissions."
        );
      } else {
        setErrorMessage("Failed to fetch suggestions. Please try again.");
      }
    }
  };

  const handleInputChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
  };

  const playTrack = async (
    id,
    name,
    artists,
    image,
    context_uri,
    track_number
  ) => {
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

  const openExternalLink = (externalUrl) => {
    window.open(externalUrl, "_blank"); // Open link in a new tab
  };

  return (
    <Container navBackground={navBackground}>
      <div className="search__bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Tracks, albums, or artists"
          value={searchQuery}
          onChange={handleInputChange}
        />
        {searchQuery && (
          <ul className="suggestions">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => {
                  if (
                    suggestion.type === "artist" ||
                    suggestion.type === "album"
                  ) {
                    openExternalLink(suggestion.external_urls.spotify); // Open Spotify link for artist or album
                  } else {
                    playTrack(
                      suggestion.id,
                      suggestion.name,
                      suggestion.artists,
                      suggestion.image,
                      suggestion.context_uri,
                      suggestion.track_number
                    );
                  }
                }}
              >
                {suggestion.image && (
                  <img
                    src={suggestion.image}
                    alt={`${suggestion.name} cover`}
                  />
                )}

                <span>{suggestion.name}</span>
                <span className="item-type">{suggestion.type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="avatar">
        <a href={userInfo?.userUrl}>
          <CgProfile />
          <span>{userInfo?.name}</span>
        </a>
      </div>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  height: 15vh;
  position: sticky;
  top: 0;
  transition: 0.3s ease-in-out;
  background-color: ${({ navBackground }) =>
    navBackground ? "rgba(0,0,0,0.7)" : "none"};

  .avatar {
    background-color: #111;
    padding: 0.5rem 1.2rem;
    border-radius: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s ease;

    a {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      color: #fff;
      font-weight: bold;

      svg {
        font-size: 1.4rem;
        background-color: #333;
        padding: 0.4rem;
        border-radius: 1rem;
        color: #ccc;
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      &:hover svg {
        background-color: #282828;
        color: #fff;
      }
    }
  }
    
.search__bar {
    position: relative;
    background-color: white;
    width: 40%;
    padding: 0.5rem 1.2rem;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.search__bar input {
    border: none;
    height: 2rem;
    width: 100%;
    font-size: 1rem;
    padding: 0.1rem 0.5rem;
    color: #333;
    border-radius: 2rem;
    background: #f8f8f8;
}

.search__bar input:focus {
    outline: none;
    background-color: #fff;
}

.search__bar:focus-within {
    box-shadow: 0 0 6px 2px rgba(0, 100, 255, 0.4);
    transform: scale(1);
}

.suggestions {
    position: absolute;
    top: calc(100% + 1rem); 
    left: 0;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    width: 100%; /* Matching width of search bar */
    z-index: 1;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.3s ease;
}

.suggestions li {
    list-style-type: none;
    padding: 10px 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease;
    border-radius: 8px;
}

.suggestions li img {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    margin-right: 10px;
}

.suggestions li span {
    color: #333;
    font-weight: 500;
    margin-left: 10px;
}

.suggestions li span.item-type {
    color: #aaa;
    font-size: 0.85rem;
    margin-left: auto;
}

.suggestions li:hover {
    background-color: #f8f8f8;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .search__bar {
        width: 80%;
        padding: 0.5rem;
    }

    .suggestions {
        width: 80%;
        left: 10%;
    }
}

`;
