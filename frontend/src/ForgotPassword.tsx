import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";
import { TaskAlt, ArrowBack } from "@mui/icons-material";
import { AuthContext } from "./App";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      alert("Failed to send reset email.");
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
    }}>
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
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px', fontSize: '28px' }}>Plannex.</Typography>
          </Box>
          
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1.5px', color: '#111827', fontSize: '2.5rem' }}>
            Reset Password
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', mb: 6, fontSize: '1.1rem' }}>
            {submitted ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder." : "Enter your email address and we'll send you a link to reset your password."}
          </Typography>

          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <TextField 
                label="Email" 
                type="email"
                variant="outlined"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                fullWidth
                InputProps={{
                  sx: { borderRadius: '12px', backgroundColor: '#F9FAFB', '& fieldset': { borderColor: '#E5E7EB' } }
                }}
              />
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
                Send Reset Link
              </Button>
            </form>
          ) : (
            <Button 
              variant="outlined" 
              onClick={() => navigate("/login")}
              size="large"
              fullWidth
              sx={{ 
                mt: 1, 
                color: '#3f2b96', 
                borderColor: '#E5E7EB',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Return to Login
            </Button>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Typography variant="body1" sx={{ color: '#6B7280', fontSize: '1.1rem' }}>
              Remember your password?{' '}
              <span 
                style={{ color: '#3f2b96', cursor: 'pointer', fontWeight: 700 }}
                onClick={() => navigate("/login")}
              >
                Sign In
              </span>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Side: Image */}
      <Box sx={{
        flex: 1,
        backgroundImage: 'url(https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)',
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
            Secure your account with Plannex.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default ForgotPassword;
