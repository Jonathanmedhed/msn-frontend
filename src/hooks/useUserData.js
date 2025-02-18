import { useQuery } from "@tanstack/react-query";
import { fetchLoggedInUser, fetchUserChats } from "../api";

export const useUserData = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      const user = await fetchLoggedInUser();
      if (!user) throw new Error("User not logged in");
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
        userProfile: user || null,
        contactList: contactsWithChats || [],
        chatList: userChats || [],
      };
    },
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
