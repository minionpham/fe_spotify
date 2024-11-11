import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SpotifyPlayer from "react-spotify-web-playback";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";

export default function PlayerControls({ selectedTrack }) {
  const [{ token, currentPlaying }, dispatch] = useStateProvider();
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (selectedTrack) {
      dispatch({
        type: reducerCases.SET_PLAYING,
        currentPlaying: selectedTrack,
      });
      setPlay(true);
    }
  }, [selectedTrack, dispatch]);

  useEffect(() => {
    if (currentPlaying) {
      console.log("Current playing track URI:", currentPlaying.uri); // check log
    }
  }, [currentPlaying]);

  const handlePlayerStateChange = (state) => {
    if (!state.isPlaying) setPlay(false);
    dispatch({
      type: reducerCases.SET_PLAYER_STATE,
      playerState: state.isPlaying,
    });

  };


  if (!token) return null;
  console.log(token);
  console.log(play);
  
  
  const trackUri = currentPlaying && currentPlaying.uri ? [currentPlaying.uri] : [];
  console.log("Track URI to play:", trackUri); // check log
  return (
    <Container>
      {selectedTrack && (
         <SpotifyPlayer
         token={token}
         callback={handlePlayerStateChange}
         play={play}
         uris={trackUri}
          // phat nhac
         styles={{
           activeColor: "#fff",
           bgColor: "#181818",
           color: "#fff",
           loaderColor: "#fff",
           sliderColor: "#283593",
           trackArtistColor: "#ccc",
           trackNameColor: "#fff",
         }}
       />
      )}
     
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #181818;
  border-top: 1px solid #282828;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;
