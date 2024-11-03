import React, { useState } from "react";
import styled from "styled-components";

export default function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(""); // Reset error message

        const url = isRegistering
            ? "http://localhost:3001/api/users/register"
            : "http://localhost:3001/api/users/login";

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to Spotify auth page after successful registration/login
                handleSpotifyAuth();
            } else {
                setError(data.error); // Set error message
            }
        } catch (error) {
            console.error("Error:", error);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const handleSpotifyAuth = () => {
        const client_id = "68a6bb1c058249dc82938cb2f602cea4";
        const redirect_uri = "http://localhost:3000/";
        const api_uri = "https://accounts.spotify.com/authorize";
        const scope = [
            "user-read-email",
            "user-read-private",
            "user-modify-playback-state",
            "user-read-playback-state",
            "user-read-currently-playing",
            "playlist-read-private",
            "playlist-read-collaborative",
            "playlist-modify-public",
            "playlist-modify-private",
            "user-read-recently-played",
            "user-library-read",
            "user-library-modify",
        ];

        window.location.href = `${api_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope.join(
            " "
        )}&response_type=token&show_dialog=true`;
    };

    const toggleForm = () => {
        setIsRegistering(!isRegistering);
    };

    return (
        <Container>
            <img
                src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Black.png"
                alt="spotify"
            />
            <Form onSubmit={handleAuth}>
                <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {isRegistering ? "Register" : "Login"} {loading && "..."}
                </button>
            </Form>
            {error && <ErrorMessage>{error}</ErrorMessage>} {/* Display error message */}
            <ToggleLink onClick={toggleForm}>
                {isRegistering ? "Already have an account? Login now." : "Or register now."}
            </ToggleLink>
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background-color: #1db954;
    gap: 5rem;
    img {
        height: 20vh;
    }
    button {
        padding: 1rem 5rem;
        border-radius: 5rem;
        background-color: black;
        color: #49f585;
        border: none;
        font-size: 1.4rem;
        cursor: pointer;
        &:disabled {
            opacity: 0.5; /* Show loading state */
            cursor: not-allowed; /* Disable pointer */
        }
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Input = styled.input`
    padding: 1rem;
    border-radius: 5rem;
    border: none;
    font-size: 1.4rem;
    width: 100%;
`;

const ToggleLink = styled.button`
    background: none;
    border: none;
    color: #49f585;
    font-size: 1.2rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
`;

const ErrorMessage = styled.div`
    color: red;
    font-size: 1.2rem;
    margin-top: 1rem;
`;
