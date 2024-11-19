import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SpotifyWebPlayer from "react-spotify-web-playback";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";
import axios from "axios";
export default function PlayerControls() {
  const [{ token,currentPlaying,selectedTrack }, dispatch] = useStateProvider();
  const [play, setPlay] = useState(false);
  const[trackUri,setTrackUri] = useState([]);

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
      setTrackUri(currentPlaying.uri)
      console.log("Current playing track URI:", currentPlaying.uri); // check log
    }
  }, [currentPlaying]);

  const handlePlayerStateChange = (state) => {
    if (!state.isPlaying) setPlay(false);
    if(state.isPlaying){
      dispatch({
        type: reducerCases.SET_PLAYER_STATE,
        playerState: state.isPlaying,
      })
    }
  }

  useEffect(() =>{
    const getCurrentTrack = async () => {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );
      console.log(response);
      
      if (response.data !== "") {
        const currentPlaying = {
          id: response.data.item.id,
          name: response.data.item.name,
          artists: response.data.item.artists.map((artist) => artist.name),
          image: response.data.item.album.images[2].url,
          duration: response.data.item.duration,
          album:response.data.item.album.name,
          context_ur:response.data.item.album.uri,
          track_number: response.data.item.track_number,
          uri:response.data.item.uri
        };
        dispatch({ type: reducerCases.SET_PLAYING, currentPlaying });
        setTrackUri(currentPlaying.uri)
      } else {
        dispatch({ type: reducerCases.SET_PLAYING, currentPlaying: null });
      }
    };
    getCurrentTrack(); 
    console.log(currentPlaying);
       
  },[token,dispatch]) // callback cua useEffect goi dung 1 lan 
  
  return (
    <Container>
      {(
         <SpotifyWebPlayer
         token={token}
         callback={handlePlayerStateChange}
         play={play}
         uris={trackUri}
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
