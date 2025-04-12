const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        currentUser: action.payload.user,
        role: action.payload.role,
      };
    case "LOGOUT":
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      return {
        currentUser: null,
        role: null,
      };
    default:
      return state;
  }
};

export default authReducer;
