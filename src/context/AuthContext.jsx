// src/context/AuthContext.js
import { createContext, useContext } from "react";
import { useUserData } from "../hooks/useUserData";
import { loginUser, logoutUser, registerUser } from "../api";
import PropTypes from "prop-types";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { userProfile, contactList, chatList, loading, error, refetch } =
    useUserData();

  // Login function: calls the API, stores token, and refetches user data.
  const login = async (email, password) => {
    const response = await loginUser(email, password);
    localStorage.setItem("token", response.token);
    localStorage.setItem("userId", response.user.id);
    await refetch();
    return response.user;
  };

  // Register function: calls the API, stores token, and refetches user data.
  const register = async (name, email, password) => {
    const response = await registerUser(name, email, password);
    localStorage.setItem("token", response.token);
    localStorage.setItem("userId", response.user.id);
    await refetch();
    return response.user;
  };

  // Logout function: optionally call the API, clear tokens, and update state.
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.reload();
      // Optionally: you might want to trigger a refetch or update state to reflect logout.
    }
  };

  const value = {
    userProfile,
    contactList,
    chatList,
    loading,
    error,
    refetch,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
