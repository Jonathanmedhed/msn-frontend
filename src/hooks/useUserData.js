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
      console.log("user.friendRequestsSent: ", user.friendRequestsSent);
      console.log("user.friendRequestsReceived: ", user.friendRequestsReceived);
      // If token exists but no user is found, clear tokens and return default values
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
        // Return friend requests as full user objects (assuming they're populated in the API response)
        requestsSent: user.friendRequestsSent || [],
        requestsReceived: user.friendRequestsReceived || [],
      };
    },
    retry: false, // Disable retries if the user isn't logged in
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
