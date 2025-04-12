const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      // Save full user data including name and section
      return {
        currentUser: action.payload.user, // { uid, email, name, section }
        role: action.payload.role,        // 'admin', 'student', etc.
      };

    case "LOGOUT":
      // Clear localStorage and reset state
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
