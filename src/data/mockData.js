export const user = {
  id: "user_001",
  name: "Test User",
  email: "testuser@example.com",
  profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
  bio: "Just a test user.",
  customMessage: "Hello there!",
  status: "Online",
  isOnline: true,
  lastSeen: new Date(),
};

// Generate 10 contacts
export const contacts = Array.from({ length: 10 }, (_, i) => ({
  id: `contact_${i + 1}`,
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
}));

// Generate 5 chat conversations with 5 contacts
export const chats = contacts.slice(0, 5).map((contact, i) => ({
  id: `chat_${i + 1}`,
  participants: [user.id, contact.id],
  messages: [
    {
      id: `msg_${i + 1}_1`,
      sender: user.id,
      content: `Hey ${contact.name}, how's it going?`,
      timestamp: new Date(),
    },
    {
      id: `msg_${i + 1}_2`,
      sender: contact.id,
      content: `Hey! All good, what about you?`,
      timestamp: new Date(),
    },
  ],
  lastMessage: {
    id: `msg_${i + 1}_2`,
    sender: contact.id,
    content: `Hey! All good, what about you?`,
    timestamp: new Date(),
  },
}));
