export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };

    case "LOGOUT":
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };

    default:
      return state;
  }
};