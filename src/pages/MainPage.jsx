import { useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  List,
  ListItem,
  TextField,
  Button,
  Paper,
  IconButton,
  Drawer,
  useMediaQuery,
  CssBaseline,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import {
  MoreVert,
  Menu as MenuIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import UserCard from "../components/UserCard";

// Random image URLs for profile pictures
const randomImages = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5",
];

// Dummy contact list
const contacts = [
  {
    name: "Alice",
    status: "Online",
    avatar: randomImages[0],
    personalMessage: "Hello, world!",
  },
  { name: "Bob", status: "Away", avatar: randomImages[1], personalMessage: "" },
  {
    name: "Charlie",
    status: "Offline",
    avatar: randomImages[2],
    personalMessage: "Be back soon!",
  },
  {
    name: "Diana",
    status: "Busy",
    avatar: randomImages[3],
    personalMessage: "",
  },
  {
    name: "Eve",
    status: "Blocked",
    avatar: randomImages[4],
    personalMessage: "Blocked user",
  },
];

function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    status: "Online",
    avatar: "https://i.pravatar.cc/150?img=6",
    personalMessage: "", // Added personal message
  });
  const [anchorEl, setAnchorEl] = useState(null); // For dropdown menu
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // For edit dialog
  const [newPersonalMessage, setNewPersonalMessage] = useState(""); // For input in dialog
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const [tabIndex, setTabIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const searchInputRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle dropdown menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle dropdown menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle status change
  const handleStatusChange = (status) => {
    setUserProfile((prev) => ({ ...prev, status }));
    handleMenuClose();
  };

  // Handle edit dialog open
  const handleEditDialogOpen = () => {
    setNewPersonalMessage(userProfile.personalMessage); // Pre-fill the input with the current message
    setIsEditDialogOpen(true);
  };

  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
  };

  // Handle saving the personal message
  const handleSavePersonalMessage = () => {
    setUserProfile((prev) => ({
      ...prev,
      personalMessage: newPersonalMessage,
    }));
    handleEditDialogClose();
  };

  // Handle deleting the personal message
  const handleDeletePersonalMessage = () => {
    setUserProfile((prev) => ({ ...prev, personalMessage: "" }));
    handleEditDialogClose();
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle clearing the search input
  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current.blur(); // Deactivate the input
  };

  // Handle magnifier icon click
  const handleMagnifierClick = () => {
    searchInputRef.current.focus(); // Activate the input
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <CssBaseline />
      {/* Top Bar */}
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" onClick={toggleSidebar} edge="start">
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Microsoft Messenger
          </Typography>
          <IconButton color="inherit">
            <MoreVert />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* User Profile Box */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #ddd",
          backgroundColor: "#f5f5f5",
        }}
      >
        <UserCard
          user={userProfile}
          showArrow
          showEditIcon
          alwaysShowPersonalMessage // Always show personal message section
          onArrowClick={handleMenuOpen}
          onEditClick={handleEditDialogOpen}
        />
      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange("Online")}>Online</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Away")}>Away</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Busy")}>Busy</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Offline")}>
          Offline
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange("Blocked")}>
          Blocked
        </MenuItem>
      </Menu>

      {/* Edit Personal Message Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Personal Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={newPersonalMessage}
            onChange={(e) => setNewPersonalMessage(e.target.value)}
            placeholder="Enter personal message"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeletePersonalMessage} color="error">
            Delete
          </Button>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleSavePersonalMessage} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Content */}
      <Box
        sx={{ display: "flex", flexGrow: 1, overflow: "hidden", width: "100%" }}
      >
        {/* Sidebar (Contact List) */}
        {!isMobile ? (
          <Box sx={{ width: "25%", minWidth: "250px", overflowY: "auto" }}>
            {/* Contact List */}
            <List>
              <ListItem>
                <TextField
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          {searchQuery ? (
                            <IconButton
                              onClick={handleClearSearch}
                              size="small"
                            >
                              <CloseIcon sx={{ color: "text.secondary" }} />
                            </IconButton>
                          ) : (
                            <IconButton
                              onClick={handleMagnifierClick}
                              size="small"
                            >
                              <SearchIcon sx={{ color: "text.secondary" }} />
                            </IconButton>
                          )}
                        </InputAdornment>
                      ),
                      sx: {
                        backgroundColor: "#fafafa", // Darker background
                        borderRadius: "25px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none", // Remove the border
                        },
                      },
                    },
                  }}
                />
              </ListItem>
              {/* Tabs Header */}
              <Tabs
                value={tabIndex}
                onChange={(_, newIndex) => setTabIndex(newIndex)}
                centered
              >
                <Tab label="Contacts" />
                <Tab label="Chats" />
              </Tabs>

              {/* Tabs Content */}
              <Box sx={{ padding: 2 }}>
                {tabIndex === 0 && (
                  <List>
                    {contacts.map((contact, index) => (
                      <ListItem button key={index}>
                        <UserCard user={contact} size="small" />
                      </ListItem>
                    ))}
                  </List>
                )}
                {tabIndex === 1 && (
                  <List>
                    {contacts.map((contact, index) => (
                      <ListItem button key={index}>
                        <UserCard user={contact} size="small" />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </List>
          </Box>
        ) : (
          <Drawer anchor="left" open={isSidebarOpen} onClose={toggleSidebar}>
            <Box sx={{ width: "250px", p: 2 }}>
              {/* Search Box */}
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search"
                  size="small"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  inputRef={searchInputRef}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton onClick={handleMagnifierClick} size="small">
                          <SearchIcon sx={{ color: "text.secondary" }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClearSearch} size="small">
                          <CloseIcon sx={{ color: "text.secondary" }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: "#e0e0e0", // Darker background
                      borderRadius: "4px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none", // Remove the border
                      },
                    },
                  }}
                />
              </Box>
              {/* Contact List */}
              <List>
                {contacts.map((contact, index) => (
                  <ListItem button key={index}>
                    <UserCard user={contact} size="small" />{" "}
                    {/* Smaller cards */}
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
        )}

        {/* Chat Window */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
            }}
          >
            <UserCard user={contacts[0]} size="small" /> {/* Smaller card */}
          </Box>

          {/* Chat History */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
            {[...Array(10)].map((_, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  mb: 2,
                  maxWidth: "70%",
                  alignSelf: index % 2 === 0 ? "flex-start" : "flex-end",
                }}
              >
                <Typography>Message {index + 1}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Message Input */}
          <Box
            sx={{ p: 2, borderTop: "1px solid #ddd", display: "flex", gap: 2 }}
          >
            <TextField fullWidth placeholder="Type a message" size="small" />
            <Button variant="contained" color="primary">
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MainPage;
