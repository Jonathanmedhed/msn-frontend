import { useState, useEffect, useCallback } from "react";
import { fetchLoggedInUser, fetchUserChats } from "../api";

export const useUserData = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [contactList, setContactList] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      const user = await fetchLoggedInUser();
      if (!user) throw new Error("User not logged in");
      const userChats = await fetchUserChats(user._id.toString());
      const contactsWithChats = user.contacts.map((contact) => {
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
      setChatList(userChats);
      setUserProfile(user);
      setContactList(contactsWithChats);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    userProfile,
    contactList,
    chatList,
    loading,
    error,
    refetch: fetchUserData,
  };
};
