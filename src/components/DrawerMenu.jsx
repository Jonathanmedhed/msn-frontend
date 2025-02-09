import PropTypes from "prop-types";
import {
  AccountCircle,
  ExitToApp,
  Help,
  Notifications,
  People,
  Settings,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

export const DrawerMenu = ({
  isDrawerOpen,
  toggleDrawer,
  handleMenuItemClick,
}) => (
  <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer}>
    <Box sx={{ width: 250, padding: 2 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Microsoft Messenger
      </Typography>
      <Divider />
      <List>
        {["Account", "Settings", "Notifications", "Contacts", "Help"].map(
          (option) => (
            <ListItem
              button
              key={option}
              onClick={() => handleMenuItemClick(option)}
            >
              <ListItemIcon>
                {option === "Account" && <AccountCircle />}
                {option === "Settings" && <Settings />}
                {option === "Notifications" && <Notifications />}
                {option === "Contacts" && <People />}
                {option === "Help" && <Help />}
              </ListItemIcon>
              <ListItemText primary={option} />
            </ListItem>
          )
        )}
        <Divider />
        <ListItem button onClick={() => handleMenuItemClick("Logout")}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  </Drawer>
);

DrawerMenu.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  handleMenuItemClick: PropTypes.func.isRequired,
};
