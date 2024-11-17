import { reducerCases } from "./Constants";

export const initialState = {
  token: null,
  userInfo: null,
  playlists: [],
  currentPlaying: null,
  playerState: false,
  selectedPlaylist: null,
  selectedPlaylistId: "", // 37i9dQZF1E37jO8SiMT0yN
  newPlaylistName: "",
  selectedAlbumId: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case reducerCases.SET_TOKEN:
      return {
        ...state,
        token: action.token,
      };
    case reducerCases.SET_USER:
      return {
        ...state,
        userInfo: action.userInfo,
      };
    case reducerCases.SET_PLAYLISTS:
      return {
        ...state,
        playlists: action.playlists,
      };
    case reducerCases.SET_PLAYING:
      return {
        ...state,
        currentPlaying: action.currentPlaying,
      };
    case reducerCases.SET_PLAYER_STATE:
      return {
        ...state,
        playerState: action.playerState,
      };
    case reducerCases.SET_PLAYLIST:
      return {
        ...state,
        selectedPlaylist: action.selectedPlaylist,
      };
    case reducerCases.SET_PLAYLIST_ID:
      return {
        ...state,
        selectedPlaylistId: action.selectedPlaylistId,
      };
    case reducerCases.SET_NEW_PLAYLIST_NAME: // Case mới cho tên playlist
      return {
        ...state,
        newPlaylistName: action.newPlaylistName,
      };  
    case reducerCases.SET_CONTEXT_MENU:
      return {
        ...state,
        contextMenu: action.contextMenu,
      };
    case reducerCases.SET_SELECTED_PLAYLIST_ID:
      return {
        ...state,
        selectedPlaylistId: action.selectedPlaylistId,
      };
    case reducerCases.REFRESH_PLAYLIST:
      return {
        ...state,
        selectedPlaylistId: state.selectedPlaylistId, // Triggers useEffect in Body to refetch the playlist
      };
    case reducerCases.CLEAR_SELECTED_PLAYLIST: // Thêm xử lý này
      return { ...state, selectedPlaylist: null }; // Reset selectedPlaylist
    case "SET_SELECTED_ALBUM_ID":
      return {
        ...state,
        selectedAlbumId: action.selectedAlbumId,
      };
    default:
      return state;
  }
};

export default reducer;
