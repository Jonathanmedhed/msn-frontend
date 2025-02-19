// src/hooks/useUserData.js
import { useQuery } from "@tanstack/react-query";
import { fetchLoggedInUser, fetchUserChats } from "../api";

export const useUserData = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      // If no token, simply return null values
      if (!token) {
        return { userProfile: null, contactList: [], chatList: [] };
      }

      const user = await fetchLoggedInUser();
      // If token exists but no user is found, clear tokens and return null values
      if (!user) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        return { userProfile: null, contactList: [], chatList: [] };
      }

      const userChats = await fetchUserChats(user._id.toString());

      const contactsWithChats = (user.contacts || []).map((contact) => {
        const chat = userChats.find((chat) =>
          chat.participants.some(
            (p) => p._id.toString() === contact._id.toString()
          )
        );
        return {
          ...contact,
          chatId: chat ? chat._id : null,
          customMessage: contact.customMessage || "",
        };
      });

      return {
        userProfile: user,
        contactList: contactsWithChats,
        chatList: userChats,
      };
    },
    retry: false, // Disable retries so that if user is not logged in, it doesn't keep retrying
  });

  return {
    userProfile: data?.userProfile || null,
    contactList: data?.contactList || [],
    chatList: data?.chatList || [],
    loading: isLoading,
    error,
    refetch,
  };
};
