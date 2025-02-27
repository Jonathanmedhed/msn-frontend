import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

export const SearchInput = ({
  searchQuery,
  handleSearchChange,
  handleClearSearch,
  handleMagnifierClick,
  inputRef,
}) => {
  const { t } = useTranslation();

  return (
    <TextField
      fullWidth
      placeholder={t("search")}
      size="small"
      value={searchQuery}
      onChange={handleSearchChange}
      inputRef={inputRef}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {searchQuery ? (
                <IconButton onClick={handleClearSearch} size="small">
                  <CloseIcon sx={{ color: "text.secondary" }} />
                </IconButton>
              ) : (
                <IconButton onClick={handleMagnifierClick} size="small">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </IconButton>
              )}
            </InputAdornment>
          ),
          sx: {
            backgroundColor: "#fafafa",
            borderRadius: "25px",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          },
        },
      }}
    />
  );
};

SearchInput.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  handleClearSearch: PropTypes.func.isRequired,
  handleMagnifierClick: PropTypes.func.isRequired,
  inputRef: PropTypes.string.isRequired,
};

export default SearchInput;
