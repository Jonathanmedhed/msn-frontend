import { useContext } from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import { Menu as MenuIcon, ArrowBack } from "@mui/icons-material";
import PropTypes from "prop-types";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Moon icon for dark mode
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ThemeContext } from "../ThemeContext";

export const AppBarComponent = ({
  isMobile,
  toggleSidebar,
  showBackButton,
  onBackClick,
}) => {
  const { toggleTheme, isDarkMode } = useContext(ThemeContext);

  return (
    <AppBar position="static">
      <Toolbar>
        {showBackButton ? (
          <IconButton color="inherit" onClick={onBackClick} edge="start">
            <ArrowBack />
          </IconButton>
        ) : isMobile ? (
          <IconButton color="inherit" onClick={toggleSidebar} edge="start">
            <MenuIcon />
          </IconButton>
        ) : null}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Microsoft Messenger
        </Typography>
        <IconButton color="inherit" onClick={toggleTheme}>
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

AppBarComponent.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  showBackButton: PropTypes.bool.isRequired,
  onBackClick: PropTypes.func.isRequired,
};
