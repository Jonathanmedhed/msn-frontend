import { useState } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import PropTypes from "prop-types";

export const LoginRegister = ({ login, register }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "mainuser@example.com", // Default email
    password: "password123", // Default password
  });
  const [error, setError] = useState("");

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    // Reset to main user's credentials when switching back to login
    setFormData(
      isLogin
        ? { name: "", email: "", password: "" } // Clear for register
        : { name: "", email: "mainuser@example.com", password: "password123" } // Defaults for login
    );
    setError("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // Full viewport height
        p: 3, // Padding on all sides
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 8,
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Messenger
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
          )}
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            type="email"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            type="password"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {isLogin ? "Login" : "Register"}
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link href="#" onClick={handleToggleMode}>
            {isLogin ? "Register here" : "Login here"}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

LoginRegister.propTypes = {
  login: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
};

export default LoginRegister;
