import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";

export const SearchInput = ({
  searchQuery,
  handleSearchChange,
  handleClearSearch,
  handleMagnifierClick,
  inputRef,
}) => (
  <TextField
    fullWidth
    placeholder="Search"
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
