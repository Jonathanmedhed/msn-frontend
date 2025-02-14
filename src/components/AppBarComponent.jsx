import { useContext } from "react";
import { AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";
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
}) => {
  const { toggleTheme, isDarkMode } = useContext(ThemeContext);

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
          <IconButton color="inherit" onClick={toggleSidebar} edge="end">
            <MenuIcon />
          </IconButton>
        ) : (
          <Button color="inherit">Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

AppBarComponent.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool,
  toggleSidebar: PropTypes.func.isRequired,
  showBackButton: PropTypes.bool.isRequired,
  onBackClick: PropTypes.func.isRequired,
};
