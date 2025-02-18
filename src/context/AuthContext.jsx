// src/context/AuthContext.js
import { createContext, useContext } from "react";
import { useUserData } from "../hooks/useUserData";
import { loginUser, logoutUser } from "../api";
import PropTypes from "prop-types";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { userProfile, contactList, chatList, loading, error, refetch } =
    useUserData();

  // Login function: calls API, stores token, then refetches user data
  const login = async (email, password) => {
    const response = await loginUser(email, password);
    localStorage.setItem("token", response.token);
    localStorage.setItem("userId", response.user.id);
    await refetch();
    return response.user;
  };

  const logout = async () => {
    try {
      console.log("Logging out...");

      const token = localStorage.getItem("token");
      if (token) {
        await logoutUser(token);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      // Ensure that the authentication state updates
      refetch(); // This should trigger an update in useAuth()
    } catch (error) {
      console.error("Logout error:", error);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
