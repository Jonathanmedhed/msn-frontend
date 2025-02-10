// mockData.js

export const user = {
  _id: "user_001",
  name: "Test User",
  email: "testuser@example.com",
  profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
  bio: "Just a test user.",
  customMessage: "Hello there!",
  status: "Online",
  isOnline: true,
  lastSeen: new Date(),
};

// Generate 10 contacts, and for the first 5, assign a chatId to simulate existing chats.
export const contacts = Array.from({ length: 10 }, (_, i) => ({
  _id: `contact_${i + 1}`,
  name: `Contact ${i + 1}`,
  email: `contact${i + 1}@example.com`,
  profilePicture: `https://randomuser.me/api/portraits/${
    i % 2 === 0 ? "men" : "women"
  }/${i + 2}.jpg`,
  bio: `This is contact ${i + 1}.`,
  customMessage: `Hey, I'm Contact ${i + 1}!`,
  status: ["online", "busy", "offline", "blocked"][i % 4],
  isOnline: i % 4 === 0,
  lastSeen: new Date(),
  // For the first 5 contacts, simulate an existing chat by assigning a chatId.
  chatId: i < 5 ? `chat_${i + 1}` : undefined,
}));

// Generate 5 chat conversations with the first 5 contacts
export const chats = contacts.slice(0, 5).map((contact, i) => ({
  _id: `chat_${i + 1}`,
  participants: [user._id, contact._id],
  messages: [
    {
      _id: `msg_${i + 1}_1`,
      sender: user._id,
      content: `Hey ${contact.name}, how's it going?`,
      timestamp: new Date(),
    },
    {
      _id: `msg_${i + 1}_2`,
      sender: contact._id,
      content: `Hey! All good, what about you?`,
      timestamp: new Date(),
    },
  ],
  lastMessage: {
    _id: `msg_${i + 1}_2`,
    sender: contact._id,
    content: `Hey! All good, what about you?`,
    timestamp: new Date(),
  },
}));
