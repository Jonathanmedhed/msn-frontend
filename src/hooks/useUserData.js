// src/hooks/useUserData.js
import { useQuery } from "@tanstack/react-query";
import { fetchLoggedInUser, fetchUserChats } from "../api";

export const useUserData = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      // If no token, return default values
      if (!token) {
        return {
          userProfile: null,
          contactList: [],
          chatList: [],
          requestsSent: [],
          requestsReceived: [],
        };
      }

      const user = await fetchLoggedInUser();
      // If no user is returned, clear tokens and return defaults.
      if (!user) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        return {
          userProfile: null,
          contactList: [],
          chatList: [],
          requestsSent: [],
          requestsReceived: [],
        };
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
          pictures: contact.pictures || [],
        };
      });

      return {
        userProfile: user,
        contactList: contactsWithChats,
        chatList: userChats,
        requestsSent: user.friendRequestsSent || [],
        requestsReceived: user.friendRequestsReceived || [],
      };
    },
    retry: false, // Don't keep retrying if not logged in
    onError: (err) => {
      // If error indicates the user is not found, clear tokens and reload
      if (err.response && err.response.status === 404) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        // Optionally, you can use a navigation method instead of reload
        window.location.reload();
      }
    },
  });

  return {
    userProfile: data?.userProfile || null,
    contactList: data?.contactList || [],
    chatList: data?.chatList || [],
    requestsSent: data?.requestsSent || [],
    requestsReceived: data?.requestsReceived || [],
    loading: isLoading,
    error,
    refetch,
  };
};
