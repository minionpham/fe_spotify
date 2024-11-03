import React, { useState } from "react";
import styled, { keyframes } from "styled-components";

export default function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // If registering, check if passwords match
        if (isRegistering && password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

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
                handleSpotifyAuth();
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
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
        setError(""); // Clear error on form switch
    };

    return (
        <Background>
            <Container>
                <Logo
                    src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png"
                    alt="Spotify"
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
                    {isRegistering && (
                        <Input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    )}
                    <Button type="submit" disabled={loading}>
                        {isRegistering ? "Register" : "Login"}
                        {loading && <Spinner />}
                    </Button>
                </Form>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <ToggleLink onClick={toggleForm}>
                    {isRegistering ? "Already have an account? Login now." : "Or register now."}
                </ToggleLink>
            </Container>
        </Background>
    );
}

const Background = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: linear-gradient(to bottom, #1db954, #191414); 
    color: #fff;
`;


const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    background-color: #222;
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    gap: 1rem;
`;

const Logo = styled.img`
  
    width: 50%;
    margin-bottom: 1rem;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
`;

const Input = styled.input`
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #333;
    background-color: #111;
    color: #fff;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s;
    &:focus {
        border-color: #1db954;
        box-shadow: 0 0 5px #1db954;
    }
`;

const Button = styled.button`
    padding: 1rem 4rem; 
    border-radius: 50px; 
    background-color: #1db954;
    color: #fff;
    font-size: 1.2rem;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #1ed760;
    }

    &:disabled {
        background-color: #666;
        cursor: not-allowed;
    }
`;

const Spinner = styled.div`
    margin-left: 0.5rem;
    width: 1rem;
    height: 1rem;
    border: 2px solid #fff;
    border-top: 2px solid #1db954;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const ToggleLink = styled.button`
    background: none;
    border: none;
    color: #1db954;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: underline;
    margin-top: 1rem;
`;

const ErrorMessage = styled.div`
    color: #ff4d4f;
    font-size: 1rem;
    margin-top: 0.5rem;
    text-align: center;
`;
