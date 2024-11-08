import React from "react";
import styled from "styled-components";

export default function Home() {
  return (
    <Container>
      <h1>Welcome to Spotify Clone</h1>
      <p>Select a playlist to get started!</p>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  background-color: #1a1a1a;
  text-align: center;

  h1 {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  p {
    font-size: 1.5rem;
  }
`;