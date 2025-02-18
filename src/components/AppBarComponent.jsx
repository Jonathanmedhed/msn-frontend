import { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import { Menu as MenuIcon, ArrowBack } from "@mui/icons-material";
import PropTypes from "prop-types";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ThemeContext } from "../ThemeContext";

export const AppBarComponent = ({
  //isMobile,
  toggleSidebar,
  showBackButton,
  onBackClick,
  isLoggedIn,
  onLoginClick,
  logout,
}) => {
  const { toggleTheme, isDarkMode } = useContext(ThemeContext);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {showBackButton && (
          <IconButton color="inherit" onClick={onBackClick} edge="start">
            <ArrowBack />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Microsoft Messenger
        </Typography>

        <IconButton color="inherit" onClick={toggleTheme}>
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {isLoggedIn ? (
          <Box>
            <IconButton color="inherit" onClick={toggleSidebar} edge="end">
              <MenuIcon />
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Button color="inherit" onClick={onLoginClick}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

AppBarComponent.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  showBackButton: PropTypes.bool.isRequired,
  onBackClick: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func,
  logout: PropTypes.func,
};
