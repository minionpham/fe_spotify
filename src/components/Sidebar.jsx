import React from "react";
import styled from "styled-components";
import Playlists from "./Playlists";

export default function Sidebar() {
  return (
    <Container>
      <div className="top__links">
        <div className="logo">
          <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Full_Logo_RGB_White.png"
           alt="Spotify-Clone-Logo"
          />
        </div>
        <ul>
          <li>
            <span>Home</span>
          </li>
          <li>
            <span>Search</span>
          </li>
          <li>
            <span>Your Library</span>
          </li>
        </ul>
      </div>
      <Playlists/>
    </Container>
  );
}

const Container = styled.div`
  background-color: black;
  color: #b3b3b3;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .top__links {
    display: flex;
    flex-direction: column;
    .logo {
    text-align: center;
    margin: 1rem 0;
    img {
        width: 90%;      
        max-height: 100px;  
        object-fit: contain; 
    }
}
    }
    ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      li {
        display: flex;
        gap: 1rem;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover{
          color: white;
        }
      }
    }
  }
`;
