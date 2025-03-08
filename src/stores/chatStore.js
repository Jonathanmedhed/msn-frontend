import { create } from "zustand";

export const useChatStore = create((set) => ({
  chats: {},
  chatList: [],

  initializeChatMessages: (chatId, messages) => {
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: {
          ...state.chats[chatId],
          messages: messages,
        },
      },
    }));
  },

  addMessage: (chatId, message) => {
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: {
          ...(state.chats[chatId] || { messages: [] }),
          messages: [...(state.chats[chatId]?.messages || []), message],
        },
      },
    }));
  },

  updateMessage: (chatId, updatedMessage) => {
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: {
          ...state.chats[chatId],
          messages: (state.chats[chatId]?.messages || []).map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          ),
        },
      },
    }));
  },
  // Add optimistic message
  addOptimisticMessage: (chatId, tempMessage) => {
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: {
          ...state.chats[chatId],
          messages: [...(state.chats[chatId]?.messages || []), tempMessage],
        },
      },
    }));
  },

  // Replace temp message with real one
  confirmMessage: (chatId, tempId, realMessage) => {
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: {
          ...state.chats[chatId],
          messages: (state.chats[chatId]?.messages || []).map((msg) =>
            msg._id === tempId ? realMessage : msg
          ),
        },
      },
    }));
  },

  // Handle failed messages
  markMessageFailed: (chatId, tempId, error) => {
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: {
          ...state.chats[chatId],
          messages: (state.chats[chatId]?.messages || []).map((msg) =>
            msg._id === tempId ? { ...msg, status: "failed", error } : msg
          ),
        },
      },
    }));
  },

  // Add preview attachments
  addPreviewMessage: (chatId, previewMessage) => {
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: {
          ...state.chats[chatId],
          messages: [...(state.chats[chatId]?.messages || []), previewMessage],
        },
      },
    }));
  },

  // Remove preview message
  removePreviewMessage: (chatId, tempId) => {
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: {
          ...state.chats[chatId],
          messages: (state.chats[chatId]?.messages || []).filter(
            (msg) => msg._id !== tempId
          ),
        },
      },
    }));
  },

  updateChatInList: (chatId, update) => {
    set((state) => ({
      chatList: state.chatList.map((chat) =>
        chat._id === chatId ? { ...chat, ...update } : chat
      ),
    }));
  },

  // Add this new action
  setChatList: (newChatList) => set({ chatList: newChatList }),
}));
