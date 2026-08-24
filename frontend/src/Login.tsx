import React, { useState, useContext } from "react";
import { AuthContext } from "./App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Box, Typography, InputAdornment, IconButton } from "@mui/material";
import { TaskAlt, Visibility, VisibilityOff } from "@mui/icons-material";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    try {
      const response = await axios.post("http://127.0.0.1:8000/login", formData);
      login(response.data.access_token);
    } catch (err) {
      alert("Login failed!");
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
    }}>
      {/* Left Side: Form */}
      <Box sx={{
        width: { xs: '100%', md: '45%' },
        padding: { xs: '40px 30px', md: '0 100px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        <Box sx={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 8, color: '#3f2b96' }}>
            <TaskAlt sx={{ fontSize: 36 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px', fontSize: '28px' }}>PlanNex.</Typography>
          </Box>
          
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1.5px', color: '#111827', fontSize: '2.8rem' }}>Welcome Back!</Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', mb: 6, fontSize: '1.2rem' }}>
            Please enter your login details below
          </Typography>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <TextField 
              label="Username" 
              variant="outlined"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              fullWidth
              InputProps={{
                sx: { borderRadius: '12px', backgroundColor: '#F9FAFB', '& fieldset': { borderColor: '#E5E7EB' } }
              }}
            />
            <TextField 
              label="Password" 
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              fullWidth
              InputProps={{
                sx: { borderRadius: '12px', backgroundColor: '#F9FAFB', '& fieldset': { borderColor: '#E5E7EB' } },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Typography 
              variant="body2" 
              onClick={() => navigate("/forgot-password")}
              sx={{ textAlign: 'right', color: '#3f2b96', cursor: 'pointer', fontWeight: 600, mt: -1, fontSize: '1rem' }}
            >
              Forgot password?
            </Typography>

            <Button 
              variant="contained" 
              type="submit"
              size="large"
              disableElevation
              sx={{ 
                mt: 1, 
                backgroundColor: '#3f2b96', 
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(63, 43, 150, 0.39)',
                '&:hover': { backgroundColor: '#2e1e75', boxShadow: '0 6px 20px rgba(63, 43, 150, 0.23)' }
              }}
            >
              Sign in
            </Button>
          </form>

          <Box sx={{ display: 'flex', alignItems: 'center', my: 4 }}>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
            <Typography variant="body2" sx={{ px: 2, color: '#6B7280', fontWeight: 500 }}>
              Or continue with
            </Typography>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
          </Box>

          <Button 
            variant="outlined" 
            fullWidth
            size="large"
            onClick={() => window.location.href = "http://127.0.0.1:8000/auth/google/login"}
            sx={{ 
              color: '#374151', 
              borderColor: '#E5E7EB',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: 'white',
              '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5
            }}
          >
            <svg width="24" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.14 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Log in with Google
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Typography variant="body1" sx={{ color: '#6B7280', fontSize: '1.1rem' }}>
              Don't have an account?{' '}
              <span 
                style={{ color: '#3f2b96', cursor: 'pointer', fontWeight: 700 }}
                onClick={() => navigate("/register")}
              >
                Sign Up
              </span>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Side: Image */}
      <Box sx={{
        flex: 1,
        backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '60px',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(32, 20, 80, 0.7)',
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 2, 
            lineHeight: 1.4,
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '-0.5px'
          }}>
            Manage your tasks in an easy and more efficient way with PlanNex.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
