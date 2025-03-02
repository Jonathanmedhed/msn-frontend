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
import { useTranslation } from "react-i18next";

export const AppBarComponent = ({
  //isMobile,
  toggleSidebar,
  showBackButton,
  onBackClick,
  isLoggedIn,
  onLoginClick,
}) => {
  const { t } = useTranslation();

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

        {isLoggedIn ? (
          <Box>
            <IconButton color="inherit" onClick={toggleSidebar} edge="end">
              <MenuIcon />
            </IconButton>
          </Box>
        ) : (
          <Button color="inherit" onClick={onLoginClick}>
            {t("login")}
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
};
